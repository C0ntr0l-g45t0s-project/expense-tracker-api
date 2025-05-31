export class CreateTransactionDto {
  amount: number;
  type: 'income' | 'expense';
  categoryId: number;
  transactionDate: Date;
  note?: string;
}
