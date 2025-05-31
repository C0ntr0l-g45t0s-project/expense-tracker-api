export class UpdateTransactionDto {
  amount?: number;
  type?: 'income' | 'expense';
  category?: string;
  transactionDate?: Date;
  note?: string;
}
