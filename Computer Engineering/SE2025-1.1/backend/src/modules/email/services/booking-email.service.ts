import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseEmailService } from './base-email.service';
import { EmailMessage } from '../interfaces';

/**
 * Booking Email Service
 * Sends booking confirmation emails with QR code tickets
 * 
 * @author HNLong
 * @since 2025-11-27
 */
@Injectable()
export class BookingEmailService extends BaseEmailService {
  private readonly logger = new Logger(BookingEmailService.name);

  constructor(configService: ConfigService) {
    super(configService);
  }

  /**
   * Send booking confirmation email with QR code
   * 
   * @param to - Recipient email address
   * @param bookingData - Booking information
   * @returns Promise<boolean> - true if email sent successfully
   */
  async sendBookingConfirmation(
    to: string,
    bookingData: {
      bookingCode: string;
      userName: string;
      movieTitle: string;
      theaterName: string;
      roomName: string;
      showtime: string;
      seats: string[];
      totalAmount: number;
      qrCodeDataUrl: string; // Base64 QR code image
    },
  ): Promise<boolean> {
    try {
      this.logger.log(`📧 Sending booking confirmation to ${to} for booking ${bookingData.bookingCode}`);

      const subject = `🎬 Xác nhận đặt vé - ${bookingData.movieTitle} - ${bookingData.bookingCode}`;
      
      // Extract base64 from data URL
      const qrCodeBase64 = bookingData.qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
      
      // Use CID for inline image
      const qrCid = `qr-${bookingData.bookingCode}@cinemasystem.com`;
      
      // Generate HTML with CID reference
      const body = this.generateBookingEmailHtml({
        ...bookingData,
        qrCodeDataUrl: `cid:${qrCid}` // Use CID instead of data URL
      });

      const emailMessage: EmailMessage = {
        to,
        subject,
        body,
        isHtml: true,
        fromEmail: this.emailSettings.senderEmail,
        fromName: this.emailSettings.senderName,
        attachments: [{
          filename: `qr-${bookingData.bookingCode}.png`,
          content: qrCodeBase64,
          encoding: 'base64',
          cid: qrCid
        }]
      };

      const result = await this.sendEmailMessage(emailMessage);

      if (result) {
        this.logger.log(`✅ Booking confirmation email sent successfully to ${to}`);
      } else {
        this.logger.error(`❌ Failed to send booking confirmation email to ${to}`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(`❌ Error sending booking confirmation email: ${errorMessage}`, errorStack);
      return false;
    }
  }

  /**
   * Generate HTML template for booking confirmation email
   */
  private generateBookingEmailHtml(bookingData: {
    bookingCode: string;
    userName: string;
    movieTitle: string;
    theaterName: string;
    roomName: string;
    showtime: string;
    seats: string[];
    totalAmount: number;
    qrCodeDataUrl: string;
  }): string {
    const seatsText = bookingData.seats.join(', ');
    const formattedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(bookingData.totalAmount);

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đặt vé</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #333;
    }
    .booking-info {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .booking-info h2 {
      margin-top: 0;
      color: #667eea;
      font-size: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #666;
    }
    .info-value {
      color: #333;
      text-align: right;
    }
    .qr-code-section {
      text-align: center;
      margin: 30px 0;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 10px;
    }
    .qr-code-section h3 {
      color: #667eea;
      margin-bottom: 15px;
    }
    .qr-code-section img {
      max-width: 300px;
      height: auto;
      border: 3px solid #667eea;
      border-radius: 10px;
      padding: 10px;
      background: white;
    }
    .qr-instructions {
      margin-top: 15px;
      padding: 15px;
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      border-radius: 5px;
      text-align: left;
    }
    .qr-instructions strong {
      color: #856404;
    }
    .total-amount {
      font-size: 24px;
      font-weight: bold;
      color: #28a745;
      margin: 20px 0;
      text-align: center;
      padding: 15px;
      background-color: #d4edda;
      border-radius: 5px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: 600;
    }
    @media only screen and (max-width: 600px) {
      .info-row {
        flex-direction: column;
      }
      .info-value {
        text-align: left;
        margin-top: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎬 Xác Nhận Đặt Vé Thành Công</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        Chào <strong>${bookingData.userName}</strong>,
      </div>
      
      <p>Cảm ơn bạn đã đặt vé xem phim tại hệ thống của chúng tôi! Đơn đặt vé của bạn đã được xác nhận thành công.</p>
      
      <div class="booking-info">
        <h2>📋 Thông tin đặt vé</h2>
        
        <div class="info-row">
          <span class="info-label">Mã đặt vé:</span>
          <span class="info-value"><strong>${bookingData.bookingCode}</strong></span>
        </div>
        
        <div class="info-row">
          <span class="info-label">🎥 Phim:</span>
          <span class="info-value"><strong>${bookingData.movieTitle}</strong></span>
        </div>
        
        <div class="info-row">
          <span class="info-label">🏢 Rạp:</span>
          <span class="info-value">${bookingData.theaterName}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">🚪 Phòng:</span>
          <span class="info-value">${bookingData.roomName}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">🕒 Suất chiếu:</span>
          <span class="info-value">${bookingData.showtime}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">💺 Ghế:</span>
          <span class="info-value"><strong>${seatsText}</strong></span>
        </div>
      </div>
      
      <div class="total-amount">
        💰 Tổng thanh toán: ${formattedAmount}
      </div>
      
      <div class="qr-code-section">
        <h3>🎫 Mã QR vé của bạn</h3>
        <p>Vui lòng xuất trình mã QR này tại quầy để nhận vé:</p>
        <img src="${bookingData.qrCodeDataUrl}" alt="QR Code" />
        
        <div class="qr-instructions">
          <strong>📌 Lưu ý quan trọng:</strong>
          <ul style="text-align: left; margin: 10px 0;">
            <li>Vui lòng đến rạp trước giờ chiếu <strong>15 phút</strong></li>
            <li>Xuất trình mã QR này tại quầy để nhận vé giấy</li>
            <li>Giữ email này hoặc lưu ảnh mã QR trên điện thoại</li>
            <li>Mã QR chỉ có hiệu lực cho suất chiếu đã chọn</li>
          </ul>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #666;">Chúc bạn có trải nghiệm xem phim thú vị! 🍿</p>
      </div>
    </div>
    
    <div class="footer">
      <p>Email này được gửi tự động, vui lòng không trả lời.</p>
      <p>Nếu có thắc mắc, vui lòng liên hệ: <a href="mailto:support@cinemasystem.com">support@cinemasystem.com</a></p>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        © 2025 Cinema System. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send payment success notification
   * (Optional - for when payment completed but booking already confirmed)
   */
  async sendPaymentSuccessNotification(
    to: string,
    bookingCode: string,
    amount: number,
  ): Promise<boolean> {
    try {
      const formattedAmount = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);

      const subject = `💳 Thanh toán thành công - ${bookingCode}`;
      const body = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #28a745;">✅ Thanh toán thành công</h2>
          <p>Giao dịch thanh toán của bạn đã được xử lý thành công.</p>
          <p><strong>Mã đặt vé:</strong> ${bookingCode}</p>
          <p><strong>Số tiền:</strong> ${formattedAmount}</p>
          <p>Vé điện tử đã được gửi trong email riêng.</p>
        </div>
      `;

      return await this.sendEmail(to, subject, body, true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error sending payment success notification: ${errorMessage}`);
      return false;
    }
  }
}
