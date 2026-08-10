import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import { Payment, WebhookLog } from './entities';
import { CreatePaymentDto, PaymentResponseDto, VNPayWebhookDto } from './dto';
import { BookingService } from '../bookings/booking.service';
import { RedisService } from '../../common/services/redis.service';

/**
 * Payment Service - VNPay integration and webhook handling
 * Handles payment gateway communication and transaction processing
 * 
 * @author HNLong
 * @since 2025-11-24
 */
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  // VNPay Configuration
  private readonly VNPAY_URL: string;
  private readonly VNPAY_TMN_CODE: string;
  private readonly VNPAY_HASH_SECRET: string;
  private readonly VNPAY_RETURN_URL: string;
  private readonly VNPAY_IPN_URL: string;

  // Constants
  private readonly PAYMENT_TIMEOUT_MINUTES = 15;
  private readonly IDEMPOTENCY_TTL = 86400; // 24 hours

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(WebhookLog)
    private webhookLogRepository: Repository<WebhookLog>,
    @Inject(forwardRef(() => BookingService))
    private bookingService: BookingService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {
    // Load VNPay config from environment
    this.VNPAY_URL = this.configService.get<string>('VNPAY_URL') || 
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    this.VNPAY_TMN_CODE = this.configService.get<string>('VNPAY_TMN_CODE') || '';
    this.VNPAY_HASH_SECRET = this.configService.get<string>('VNPAY_HASH_SECRET') || '';
    this.VNPAY_RETURN_URL = this.configService.get<string>('VNPAY_RETURN_URL') || 
      'http://localhost:3000/payment/result';
    this.VNPAY_IPN_URL = this.configService.get<string>('VNPAY_IPN_URL') || 
      'http://localhost:5000/api/payments/vnpay/callback';

    if (!this.VNPAY_TMN_CODE || !this.VNPAY_HASH_SECRET) {
      this.logger.warn('⚠️ VNPay credentials not configured. Payment will not work.');
    }
  }

  /**
   * Create payment and generate VNPay payment URL
   * 
   * @param dto - Payment creation data
   * @param userId - User ID from JWT
   * @returns Payment record with payment URL
   */
  async createPayment(
    dto: CreatePaymentDto,
    userId: string,
  ): Promise<PaymentResponseDto> {
    // 1. Check idempotency
    const idempotencyKey = `payment:${userId}:${dto.idempotencyKey}`;
    const cached = await this.redisService.get(idempotencyKey);
    
    if (cached) {
      this.logger.log(`♻️ Returning cached payment for key ${dto.idempotencyKey}`);
      return JSON.parse(cached);
    }

    // 2. Get booking and verify
    const booking = await this.bookingService.findById(dto.bookingId);

    if (booking.userId !== userId) {
      throw new BadRequestException('Bạn không sở hữu booking này');
    }

    if (booking.status !== 'Pending') {
      throw new BadRequestException(
        `Booking có trạng thái ${booking.status}, không thể thanh toán`,
      );
    }

    // Check if booking already has successful payment
    const existingPayment = await this.paymentRepository.findOne({
      where: { bookingId: booking.bookingId, status: 'Success' },
    });

    if (existingPayment) {
      throw new ConflictException('Booking đã được thanh toán');
    }

    // 3. Create payment record
    const payment = this.paymentRepository.create({
      bookingId: booking.bookingId,
      paymentMethod: dto.paymentMethod,
      paymentGateway: dto.paymentGateway || 'VNPay',
      amount: Number(booking.finalAmount),
      currency: 'VND',
      status: 'Pending',
      idempotencyKey: dto.idempotencyKey,
      createdBy: userId,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    this.logger.log(
      `💳 Created payment ${savedPayment.paymentId} for booking ${booking.bookingCode}`,
    );

    // 4. Generate VNPay payment URL
    const paymentUrl = await this.generateVNPayUrl(
      savedPayment,
      booking.bookingCode,
      dto.returnUrl,
      // No bankCode - let VNPay show all payment methods
    );

    // 5. Calculate expiry
    const expiresAt = new Date(booking.expiryDate);

    // 6. Build response
    const response: PaymentResponseDto = {
      paymentId: savedPayment.paymentId,
      bookingId: booking.bookingId,
      paymentMethod: savedPayment.paymentMethod,
      paymentGateway: savedPayment.paymentGateway!,
      amount: Number(savedPayment.amount),
      currency: savedPayment.currency,
      status: savedPayment.status,
      paymentUrl,
      expiresAt,
    };

    // 7. Cache response for idempotency
    await this.redisService.set(
      idempotencyKey,
      JSON.stringify(response),
      this.IDEMPOTENCY_TTL,
    );

    return response;
  }

  /**
   * Generate VNPay payment URL with HMAC signature
   * 
   * @param payment - Payment record
   * @param orderInfo - Order description
   * @param returnUrl - Custom return URL (optional)
   * @returns VNPay payment URL
   */
  private async generateVNPayUrl(
    payment: Payment,
    orderInfo: string,
    returnUrl?: string,
  ): Promise<string> {
    const date = new Date();
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(
      new Date(date.getTime() + this.PAYMENT_TIMEOUT_MINUTES * 60000),
    );

    // VNPay parameters (must be sorted alphabetically for HMAC)
    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.VNPAY_TMN_CODE,
      vnp_Amount: String(Math.round(Number(payment.amount) * 100)), // VNPay uses smallest unit (1 VND = 100)
      vnp_CurrCode: 'VND',
      vnp_TxnRef: String(payment.paymentId), // Use paymentId as transaction reference
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: returnUrl || this.VNPAY_RETURN_URL,
      vnp_IpAddr: '127.0.0.1', // TODO: Get real IP from request
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Let VNPay show all available payment methods (no bankCode specified)
    this.logger.log('🏦 No bank code specified - showing all payment methods');

    // Sort params alphabetically
    const sortedParams = Object.keys(vnpParams)
      .sort()
      .reduce((acc, key) => {
        acc[key] = vnpParams[key];
        return acc;
      }, {} as Record<string, string>);

    // Build query string for HMAC
    const queryString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    // Generate HMAC-SHA512 signature
    const hmac = CryptoJS.HmacSHA512(queryString, this.VNPAY_HASH_SECRET);
    const secureHash = hmac.toString(CryptoJS.enc.Hex);

    // Build final URL
    const paymentUrl = `${this.VNPAY_URL}?${queryString}&vnp_SecureHash=${secureHash}`;

    this.logger.log(`🔗 Generated VNPay URL for payment ${payment.paymentId}`);

    return paymentUrl;
  }

  /**
   * Handle VNPay webhook callback
   * Verifies signature and processes payment result
   * 
   * @param webhookData - VNPay callback parameters
   * @returns Processing result
   */
  async handleVNPayWebhook(webhookData: VNPayWebhookDto): Promise<{
    success: boolean;
    message: string;
  }> {
    // 1. Log webhook (for audit)
    const webhookLog = this.webhookLogRepository.create({
      gateway: 'VNPay',
      event: 'payment.callback',
      payload: webhookData,
      status: 'Pending',
    });
    const savedLog = await this.webhookLogRepository.save(webhookLog);

    try {
      // 2. Verify HMAC signature
      const isValidSignature = this.verifyVNPaySignature(webhookData);
      
      webhookLog.hmacVerified = isValidSignature;
      await this.webhookLogRepository.save(webhookLog);

      if (!isValidSignature) {
        const error = 'Invalid HMAC signature';
        webhookLog.status = 'Failed';
        webhookLog.errorMessage = error;
        await this.webhookLogRepository.save(webhookLog);
        
        this.logger.error(`❌ ${error} for webhook ${savedLog.webhookId}`);
        return { success: false, message: error };
      }

      // 3. Get payment by txnRef (paymentId)
      const paymentId = parseInt(webhookData.vnp_TxnRef, 10);
      const payment = await this.paymentRepository.findOne({
        where: { paymentId },
        relations: ['booking'],
      });

      if (!payment) {
        const error = `Payment ${paymentId} not found`;
        webhookLog.status = 'Failed';
        webhookLog.errorMessage = error;
        await this.webhookLogRepository.save(webhookLog);
        
        this.logger.error(`❌ ${error}`);
        return { success: false, message: error };
      }

      webhookLog.paymentId = payment.paymentId;

      // 4. Check response code (00 = success)
      const responseCode = webhookData.vnp_ResponseCode;
      const transactionStatus = webhookData.vnp_TransactionStatus;

      if (responseCode === '00' && transactionStatus === '00') {
        // Payment success
        await this.processPaymentSuccess(payment, webhookData);
        
        webhookLog.status = 'Success';
        webhookLog.processedAt = new Date();
        await this.webhookLogRepository.save(webhookLog);

        return { success: true, message: 'Payment processed successfully' };
      } else {
        // Payment failed
        await this.processPaymentFailure(payment, webhookData, responseCode);
        
        webhookLog.status = 'Success'; // Webhook processed successfully (but payment failed)
        webhookLog.processedAt = new Date();
        await this.webhookLogRepository.save(webhookLog);

        return { success: true, message: 'Payment failure processed' };
      }

    } catch (error: any) {
      this.logger.error('Error processing VNPay webhook:', error);
      
      webhookLog.status = 'Failed';
      webhookLog.errorMessage = error.message;
      await this.webhookLogRepository.save(webhookLog);

      return { success: false, message: error.message };
    }
  }

  /**
   * Verify VNPay HMAC signature
   */
  private verifyVNPaySignature(data: VNPayWebhookDto): boolean {
    try {
      const secureHash = data.vnp_SecureHash;
      
      // Remove signature from data
      const { vnp_SecureHash, vnp_SecureHashType, ...params } = data;

      // Sort params alphabetically
      const sortedParams = Object.keys(params)
        .sort()
        .reduce((acc, key) => {
          // Use the same percent-encoding behavior as when we generated the VNPay URL
          const v = (params as any)[key]
          acc[key] = v === undefined || v === null ? '' : String(v)
          return acc;
        }, {} as Record<string, string>);

      // Build query string
      // VNPay expects values to be URL-encoded when calculating the secure hash.
      // Mirror the encoding used when creating the payment URL to avoid mismatches.
      const queryString = Object.entries(sortedParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
        

      // Generate HMAC
      const hmac = CryptoJS.HmacSHA512(queryString, this.VNPAY_HASH_SECRET);
      const calculatedHash = hmac.toString(CryptoJS.enc.Hex);

      return calculatedHash === secureHash;
    } catch (error) {
      this.logger.error('Error verifying VNPay signature:', error);
      return false;
    }
  }

  /**
   * Process successful payment
   */
  private async processPaymentSuccess(
    payment: Payment,
    webhookData: VNPayWebhookDto,
  ): Promise<void> {
    // Update payment status
    payment.status = 'Success';
    payment.transactionId = webhookData.vnp_TransactionNo;
    payment.webhookData = webhookData;
    payment.hmacSignature = webhookData.vnp_SecureHash;
    payment.modifiedDate = new Date();
    await this.paymentRepository.save(payment);

    // Confirm booking (releases Redis locks)
    await this.bookingService.confirmBooking(payment.bookingId);

    this.logger.log(
      `✅ Payment ${payment.paymentId} successful - Booking ${payment.bookingId} confirmed`,
    );

    // TODO: Trigger ticket generation and email sending
  }

  /**
   * Process failed payment
   */
  private async processPaymentFailure(
    payment: Payment,
    webhookData: VNPayWebhookDto,
    responseCode: string,
  ): Promise<void> {
    payment.status = 'Failed';
    payment.transactionId = webhookData.vnp_TransactionNo || null;
    payment.webhookData = webhookData;
    payment.hmacSignature = webhookData.vnp_SecureHash;
    payment.modifiedDate = new Date();
    payment.retryCount += 1;
    await this.paymentRepository.save(payment);

    this.logger.warn(
      `⚠️ Payment ${payment.paymentId} failed with code ${responseCode}`,
    );
  }

  /**
   * Create cash payment (admin counter payment)
   * Immediately marks payment as Success
   */
  async createCashPayment(
    bookingId: number,
    userId: string,
  ): Promise<PaymentResponseDto> {
    // Get booking and verify
    const booking = await this.bookingService.findById(bookingId);

    if (booking.userId !== userId) {
      throw new BadRequestException('Bạn không sở hữu booking này');
    }

    // Check if booking already has successful payment
    const existingPayment = await this.paymentRepository.findOne({
      where: { bookingId: booking.bookingId, status: 'Success' },
    });

    if (existingPayment) {
      // Return existing payment instead of creating duplicate
      return {
        paymentId: existingPayment.paymentId,
        bookingId: existingPayment.bookingId,
        paymentMethod: existingPayment.paymentMethod,
        paymentGateway: existingPayment.paymentGateway || 'Direct',
        amount: Number(existingPayment.amount),
        currency: existingPayment.currency,
        status: existingPayment.status,
        paymentUrl: '',
        expiresAt: new Date(),
      };
    }

    // Create payment record with Success status immediately (no gateway)
    const payment = this.paymentRepository.create({
      bookingId: booking.bookingId,
      paymentMethod: 'Cash',
      paymentGateway: 'Direct',
      amount: Number(booking.finalAmount),
      currency: 'VND',
      status: 'Success', // ✅ Mark as Success immediately for cash
      transactionId: `CASH-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      idempotencyKey: `cash-${bookingId}-${Date.now()}`,
      createdBy: userId,
      paymentDate: new Date(),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    this.logger.log(
      `💵 Created cash payment ${savedPayment.paymentId} for booking ${booking.bookingCode} - Status: Success`,
    );

    return {
      paymentId: savedPayment.paymentId,
      bookingId: savedPayment.bookingId,
      paymentMethod: savedPayment.paymentMethod,
      paymentGateway: savedPayment.paymentGateway || 'Direct',
      amount: Number(savedPayment.amount),
      currency: savedPayment.currency,
      status: savedPayment.status,
      paymentUrl: '',
      expiresAt: new Date(),
    };
  }

  /**
   * Get payment by ID
   */
  async findById(paymentId: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentId },
      relations: ['booking'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} không tồn tại`);
    }

    return payment;
  }

  /**
   * Get payments by booking ID
   */
  async findByBooking(bookingId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { bookingId },
      order: { paymentDate: 'DESC' },
    });
  }

  /**
   * TEST ONLY: Simulate successful payment without VNPay
   * Used when VNPay sandbox is unavailable
   */
  async simulateSuccessfulPayment(paymentId: number, userId: string) {
    this.logger.warn(`⚠️ TEST MODE: Simulating payment success for payment ${paymentId}`);
    
    // Get payment
    const payment = await this.findById(paymentId);
    
    // Verify ownership
    const booking = await this.bookingService.findById(payment.bookingId);
    if (booking.userId !== userId) {
      throw new BadRequestException('Không có quyền thực hiện thanh toán này');
    }
    
    // Check if already paid
    if (payment.status === 'Success') {
      throw new ConflictException('Thanh toán đã được xử lý thành công trước đó');
    }
    
    // Simulate webhook data
    const simulatedWebhook: any = {
      vnp_TxnRef: payment.paymentId.toString(),
      vnp_Amount: (payment.amount * 100).toString(),
      vnp_ResponseCode: '00',
      vnp_TransactionNo: `TEST${Date.now()}`,
      vnp_PayDate: this.formatDate(new Date()),
      vnp_BankCode: 'TESTBANK',
      vnp_CardType: 'TEST',
    };
    
    // Process as successful payment
    await this.processPaymentSuccess(payment, simulatedWebhook);
    
    this.logger.log(`✅ TEST MODE: Payment ${paymentId} simulated successfully`);
    
    // Return updated payment with booking details
    const updatedPayment = await this.findById(paymentId);
    const updatedBooking = await this.bookingService.findById(payment.bookingId);
    
    return {
      success: true,
      message: 'Payment simulated successfully (TEST MODE)',
      payment: {
        paymentId: updatedPayment.paymentId,
        status: updatedPayment.status,
        amount: updatedPayment.amount,
        transactionId: updatedPayment.transactionId,
      },
      booking: {
        bookingId: updatedBooking.bookingId,
        bookingCode: updatedBooking.bookingCode,
        status: updatedBooking.status,
        qrCode: updatedBooking.qrCode,
        ticketPDF: updatedBooking.ticketPDF,
      },
    };
  }

  // ==================== Helper Methods ====================

  /**
   * Format date for VNPay (yyyyMMddHHmmss)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}