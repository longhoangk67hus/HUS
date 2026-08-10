import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailMessage, EmailSettings } from '../interfaces';

/**
 * Base Email Service
 * Migrated from BaseCoreService.Notification.BaseEmailService
 * Uses Nodemailer instead of MailKit
 */
@Injectable()
export abstract class BaseEmailService {
  protected readonly emailSettings: EmailSettings;
  protected transporter: nodemailer.Transporter;

  constructor(protected configService: ConfigService) {
    this.emailSettings = {
      smtpHost: configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      smtpPort: configService.get<number>('SMTP_PORT', 587),
      smtpUsername: configService.get<string>('SMTP_USERNAME', ''),
      smtpPassword: configService.get<string>('SMTP_PASSWORD', ''),
      senderEmail: configService.get<string>('SENDER_EMAIL', 'noreply@cinemasystem.com'),
      senderName: configService.get<string>('SENDER_NAME', 'Cinema System'),
      enableSsl: configService.get<boolean>('SMTP_ENABLE_SSL', true),
      sendEmailAfterRegister: configService.get<boolean>('SEND_EMAIL_AFTER_REGISTER', false),
    };

    this.transporter = nodemailer.createTransport({
      host: this.emailSettings.smtpHost,
      port: this.emailSettings.smtpPort,
      secure: false, // false for STARTTLS (port 587), true for SSL (port 465)
      auth: {
        user: this.emailSettings.smtpUsername,
        pass: this.emailSettings.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates for development
      },
    });
  }

  /**
   * Send email with simple parameters
   */
  async sendEmail(to: string, subject: string, body: string, isHtml: boolean = true): Promise<boolean> {
    const message: EmailMessage = {
      to,
      subject,
      body,
      isHtml,
      fromEmail: this.emailSettings.senderEmail,
      fromName: this.emailSettings.senderName,
    };

    return await this.sendEmailMessage(message);
  }

  /**
   * Send email with EmailMessage object
   */
  async sendEmailMessage(emailMessage: EmailMessage): Promise<boolean> {
    try {
      const mailOptions: any = {
        from: `"${emailMessage.fromName || this.emailSettings.senderName}" <${emailMessage.fromEmail || this.emailSettings.senderEmail}>`,
        to: emailMessage.to,
        subject: emailMessage.subject,
        [emailMessage.isHtml ? 'html' : 'text']: emailMessage.body,
      };

      // Add attachments if provided
      if (emailMessage.attachments && emailMessage.attachments.length > 0) {
        mailOptions.attachments = emailMessage.attachments;
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}
