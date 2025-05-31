import { IsNumber, IsEnum, IsInt, IsOptional, IsDateString, Min, IsString, IsNotEmpty } from 'class-validator';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class CreateTransactionDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsInt()
  @Min(1)
  categoryId: number;

  @IsDateString()
  transactionDate: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  note?: string;
}
