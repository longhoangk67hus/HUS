import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseEmailService } from './base-email.service';

/**
 * Registration Email Service
 * Migrated from BaseCoreService.Notification.RegistrationEmailService
 */
@Injectable()
export class RegistrationEmailService extends BaseEmailService {
  constructor(configService: ConfigService) {
    super(configService);
  }

  /**
   * Send registration welcome email
   */
  async sendRegistrationEmail(toEmail: string, userName: string, fullName: string): Promise<boolean> {
    // Check if sending email is enabled
    if (!this.emailSettings.sendEmailAfterRegister) {
      console.log('Email sending is disabled in configuration');
      return true; // Return true to not block registration
    }

    const subject = 'Chào mừng đến với Hệ thống Rạp Chiếu Phim';
    const body = this.getRegistrationEmailTemplate(userName, fullName, toEmail);

    return await this.sendEmail(toEmail, subject, body, true);
  }

  /**
   * Get registration email HTML template
   * Migrated from .NET template
   */
  private getRegistrationEmailTemplate(userName: string, fullName: string, toEmail: string): string {
    const currentYear = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #d32f2f;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
            margin: -30px -30px 20px -30px;
        }
        .content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #d32f2f;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .info-box {
            background-color: #ffebee;
            border-left: 4px solid #d32f2f;
            padding: 15px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🎬 Chào mừng!</h1>
        </div>
        <div class='content'>
            <h2>Xin chào ${fullName}!</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản với Hệ thống Rạp Chiếu Phim của chúng tôi. Chúng tôi rất vui mừng được chào đón bạn!</p>
            
            <div class='info-box'>
                <strong>Thông tin tài khoản của bạn:</strong><br>
                Tên đăng nhập: <strong>${userName}</strong><br>
                Email: <strong>${toEmail}</strong>
            </div>
            
            <p>Bạn có thể đăng nhập vào tài khoản của mình và bắt đầu:</p>
            <ul>
                <li>🎥 Xem phim đang chiếu và sắp chiếu</li>
                <li>🎟️ Đặt vé xem phim trực tuyến</li>
                <li>💺 Chọn ghế ngồi yêu thích</li>
                <li>🍿 Đặt trước đồ ăn và nước uống</li>
            </ul>
            
            <p>Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
            
            <p>Trân trọng,<br>
            <strong>Đội ngũ Hệ thống Rạp Chiếu Phim</strong></p>
        </div>
        <div class='footer'>
            <p>Đây là email tự động. Vui lòng không trả lời tin nhắn này.</p>
            <p>&copy; ${currentYear} Hệ thống Rạp Chiếu Phim. Bản quyền thuộc về chúng tôi.</p>
        </div>
    </div>
</body>
</html>`;
  }
}
