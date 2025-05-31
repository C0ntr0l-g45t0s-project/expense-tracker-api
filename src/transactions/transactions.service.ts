import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { User } from '../users/user.entity';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Category } from 'src/categories/category.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private txRepo: Repository<Transaction>,
  ) {}

  async create(dto: CreateTransactionDto, user: User) {
    const category = await this.txRepo.manager.findOne(Category, {
      where: { id: dto.categoryId, user: { id: user.id } },
    });

    if (!category) {
      throw new Error('Categoría no válida para este usuario');
    }

    const transaction = this.txRepo.create({
      amount: dto.amount,
      type: dto.type,
      transactionDate: dto.transactionDate,
      note: dto.note,
      user,
      category,
    });

    return this.txRepo.save(transaction);
  }

  async findAllForUser(user: User) {
    return this.txRepo.find({
      where: { user: { id: user.id } },
      order: { transactionDate: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateTransactionDto, userId: number) {
    const tx = await this.txRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!tx) {
      throw new Error('Transacción no encontrada o no autorizada');
    }

    Object.assign(tx, dto);
    return this.txRepo.save(tx);
  }

  async delete(id: number, userId: number) {
    const tx = await this.txRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!tx) {
      throw new Error('Transacción no encontrada o no autorizada');
    }

    return this.txRepo.remove(tx);
  }

  async getSummary(userId: number) {
    const [income, expense] = await Promise.all([
      this.txRepo
        .createQueryBuilder('tx')
        .select('SUM(tx.amount)', 'total')
        .where('tx.user_id = :userId', { userId })
        .andWhere('tx.type = :type', { type: 'income' })
        .getRawOne(),

      this.txRepo
        .createQueryBuilder('tx')
        .select('SUM(tx.amount)', 'total')
        .where('tx.user_id = :userId', { userId })
        .andWhere('tx.type = :type', { type: 'expense' })
        .getRawOne(),
    ]);

    const incomeTotal = parseFloat(income?.total ?? 0);
    const expenseTotal = parseFloat(expense?.total ?? 0);

    return {
      income: incomeTotal,
      expense: expenseTotal,
      balance: incomeTotal - expenseTotal,
    };
  }

  async getMonthlySummary(userId: number) {
    const raw = await this.txRepo
      .createQueryBuilder('tx')
      .select([
        `DATE_FORMAT(tx.transactionDate, '%Y-%m') as month`,
        `tx.type`,
        `SUM(tx.amount) as total`,
      ])
      .where('tx.user_id = :userId', { userId })
      .groupBy('month, tx.type')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Procesar resultados
    const summaryMap = new Map();

    for (const row of raw) {
      const month = row.month;
      if (!summaryMap.has(month)) {
        summaryMap.set(month, { month, income: 0, expense: 0, balance: 0 });
      }

      const entry = summaryMap.get(month);
      if (row.type === 'income') {
        entry.income = parseFloat(row.total);
      } else {
        entry.expense = parseFloat(row.total);
      }
      entry.balance = entry.income - entry.expense;
    }

    return Array.from(summaryMap.values());
  }

  async getCategorySummary(userId: number, type: 'income' | 'expense') {
    const raw = await this.txRepo
      .createQueryBuilder('tx')
      .select(['cat.name AS category', 'SUM(tx.amount) AS total'])
      .innerJoin('tx.category', 'cat')
      .where('tx.user_id = :userId', { userId })
      .andWhere('tx.type = :type', { type })
      .groupBy('cat.name')
      .orderBy('total', 'DESC')
      .getRawMany();

    return raw.map((row) => ({
      category: row.category,
      total: parseFloat(row.total),
    }));
  }
}
