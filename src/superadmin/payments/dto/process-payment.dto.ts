import { IsString, IsOptional } from 'class-validator';

export class ProcessPaymentDto {
  @IsOptional()
  @IsString()
  transactionId?: string; // ID dari payment gateway

  @IsOptional()
  @IsString()
  paymentProof?: string; // URL bukti transfer untuk manual payment

  @IsOptional()
  @IsString()
  notes?: string;
}
