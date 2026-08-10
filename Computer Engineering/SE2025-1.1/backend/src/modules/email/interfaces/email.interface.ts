/**
 * Email Settings Interface
 * Migrated from BaseCoreService.Entities.EmailSettings
 */
export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  senderEmail: string;
  senderName: string;
  enableSsl: boolean;
  sendEmailAfterRegister: boolean;
}

/**
 * Email Attachment Interface
 */
export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  encoding?: string;
  cid?: string; // Content-ID for inline images
}

/**
 * Email Message Interface
 */
export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  fromEmail?: string;
  fromName?: string;
  attachments?: EmailAttachment[];
}
