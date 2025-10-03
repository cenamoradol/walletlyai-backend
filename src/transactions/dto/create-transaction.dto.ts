import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  type: 'ingreso' | 'gasto';

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsNumber()
  categoryId: number;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  note?: string;

  // Recurrente
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  recurrence?: 'daily' | 'weekly' | 'biweekly' | 'monthly';

  @IsOptional()
  @IsDateString()
  endDate?: string; // 👈 este campo es clave
}
