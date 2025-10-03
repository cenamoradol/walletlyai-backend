import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBudgetAlertDto {
  @IsNumber()
  threshold: number; // ej. 70, 90

  @IsOptional()
  @IsString()
  message?: string;
}
