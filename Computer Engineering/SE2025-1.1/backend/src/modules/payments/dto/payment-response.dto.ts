import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for payment creation
 * Contains payment URL for redirect gateways (VNPay, Stripe)
 */
export class PaymentResponseDto {
  @ApiProperty({ example: 789 })
  paymentId: number;

  @ApiProperty({ example: 456 })
  bookingId: number;

  @ApiProperty({ example: 'EWallet' })
  paymentMethod: string;

  @ApiProperty({ example: 'VNPay' })
  paymentGateway: string;

  @ApiProperty({ example: 300000 })
  amount: number;

  @ApiProperty({ example: 'VND' })
  currency: string;

  @ApiProperty({ example: 'Pending' })
  status: string;

  @ApiProperty({
    example: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...',
    description: 'Payment URL to redirect user to gateway',
  })
  paymentUrl: string;

  @ApiProperty({ example: '2025-11-24T10:00:00Z' })
  expiresAt: Date;
}

/**
 * DTO for VNPay webhook callback
 */
export class VNPayWebhookDto {
  vnp_TmnCode: string;
  vnp_Amount: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_PayDate: string;
  vnp_OrderInfo: string;
  vnp_TransactionNo: string;
  vnp_ResponseCode: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHashType: string;
  vnp_SecureHash: string;
}
