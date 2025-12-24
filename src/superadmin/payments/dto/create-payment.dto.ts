import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  subscriptionId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string; // "Credit Card", "Bank Transfer", "E-Wallet", dll

  @IsOptional()
  @IsString()
  paymentGateway?: string; // "Midtrans", "Xendit", dll

  @IsOptional()
  @IsString()
  paymentProof?: string; // URL bukti transfer

  @IsOptional()
  @IsString()
  notes?: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}
