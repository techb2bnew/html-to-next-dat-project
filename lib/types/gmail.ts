export type MessageRole = 'user' | 'broker' | 'trainer';
export type FolderType = 'inbox' | 'sent';

export interface EmailMessage {
  role: MessageRole;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  body: string;
}

export interface EmailThread {
  subject: string;
  read: boolean;
  messages: EmailMessage[];
  booked?: boolean;
  agreedRate?: number;
}

export interface LoadData {
  email?: string;
  broker?: string;
  origin?: string;
  destination?: string;
  rate?: string | number;
}
