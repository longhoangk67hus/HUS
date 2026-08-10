import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, PaymentResponseDto, VNPayWebhookDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Payment Controller
 * Handles payment creation and webhook callbacks
 * 
 * @author HNLong
 * @since 2025-11-24
 */
@ApiTags('payments')
@Controller('api/payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Create payment and get payment URL
   * User will be redirected to VNPay gateway
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create payment',
    description: 'Create payment record and generate VNPay payment URL',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment created with payment URL',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid booking or already paid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Idempotency key already used' })
  async createPayment(
    @Body() dto: CreatePaymentDto,
    @Request() req: any,
  ): Promise<PaymentResponseDto> {
    const userId = req.user.userId;
    return this.paymentService.createPayment(dto, userId);
  }

  /**
   * Create cash payment (admin counter payment)
   * Immediately marks payment as Success
   */
  @Post('cash/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create cash payment',
    description: 'Create payment for cash payment at counter (immediately marked as Success)',
  })
  @ApiResponse({
    status: 201,
    description: 'Cash payment created with Success status',
    type: PaymentResponseDto,
  })
  async createCashPayment(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Request() req: any,
  ): Promise<PaymentResponseDto> {
    const userId = req.user.userId;
    return this.paymentService.createCashPayment(bookingId, userId);
  }

  /**
   * TEST ONLY: Simulate successful payment (for sandbox testing when VNPay is down)
   */
  @Post('test/simulate-success/:paymentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[TEST] Simulate successful payment',
    description: 'Manually trigger payment success for testing when VNPay sandbox is unavailable',
  })
  
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Payment simulated successfully' })
  async simulatePaymentSuccess(
    @Param('paymentId') paymentId: number,
    @Request() req: any,
  ) {
    this.logger.warn(`⚠️ TEST MODE: Simulating payment success for payment ${paymentId}`);
    
    const result = await this.paymentService.simulateSuccessfulPayment(
      paymentId,
      req.user.userId,
    );
    
    return result;
  }

  /**
   * VNPay webhook callback (IPN - Instant Payment Notification)
   * Called by VNPay server after payment
   * PUBLIC endpoint - no auth required
   */
  @Get('vnpay/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'VNPay webhook callback',
    description: 'Receive payment result from VNPay gateway (IPN endpoint)',
  })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async vnpayCallback(@Query() query: VNPayWebhookDto) {
    this.logger.log(`📥 Received VNPay callback for txn ${query.vnp_TxnRef}`);
    
    const result = await this.paymentService.handleVNPayWebhook(query);
    
    if (result.success) {
      this.logger.log(`✅ VNPay callback processed successfully`);
    } else {
      this.logger.error(`❌ VNPay callback failed: ${result.message}`);
    }

    // VNPay expects this response format
    return {
      RspCode: result.success ? '00' : '99',
      Message: result.message,
    };
  }
    @Post('vnpay/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'VNPay webhook callback (POST)', description: 'Receive payment result from VNPay gateway via POST' })
  async vnpayCallbackPost(@Body() body: VNPayWebhookDto) {
    this.logger.log(`📥 Received VNPay POST callback for txn ${body.vnp_TxnRef}`);

    const result = await this.paymentService.handleVNPayWebhook(body);

    if (result.success) this.logger.log('✅ VNPay POST callback processed successfully');
    else this.logger.error(`❌ VNPay POST callback failed: ${result.message}`);

    return {
      RspCode: result.success ? '00' : '99',
      Message: result.message,
    };
  }


  /**
   * VNPay 
   * return URL (user redirect)
   * User lands here after completing payment on VNPay site
   * Frontend should parse query params and show result
   */
  @Get('vnpay/return')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'VNPay return URL',
    description: 'User redirect endpoint after payment on VNPay site',
  })
  @ApiResponse({ status: 200, description: 'Payment result page' })
  async vnpayReturn(@Query() query: VNPayWebhookDto) {
    this.logger.log(`🔙 User returned from VNPay for txn ${query.vnp_TxnRef}`);
    
    // Verify signature
    const result = await this.paymentService.handleVNPayWebhook(query);
    
    // Return result for frontend to display
    return {
      success: result.success,
      message: result.message,
      transactionId: query.vnp_TransactionNo,
      responseCode: query.vnp_ResponseCode,
      paymentId: query.vnp_TxnRef,
    };
  }

  /**
   * Get payment by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment by ID',
    description: 'Retrieve payment details',
  })
  @ApiParam({ name: 'id', description: 'Payment ID', example: 789 })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentById(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findById(id);
  }

  /**
   * Get payments by booking ID
   */
  @Get('booking/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payments by booking',
    description: 'Get all payment attempts for a booking',
  })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 456 })
  @ApiResponse({ status: 200, description: 'Payments retrieved' })
  async getPaymentsByBooking(
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ) {
    return this.paymentService.findByBooking(bookingId);
  }
}
