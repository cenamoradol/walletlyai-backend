import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecurringService {
  private readonly logger = new Logger(RecurringService.name);

  constructor(private prisma: PrismaService) {}

  // Ejecuta cada día a la medianoche
  //@Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRecurringTransactions() {
    this.logger.debug('Checking recurring transactions...');

    const today = new Date();
    const transactions = await this.prisma.transaction.findMany({
      where: {
        isRecurring: true,
        endDate: {
          gte: today, // todavía vigentes
        },
      },
    });

    for (const trx of transactions) {
      if (this.shouldGenerate(trx, today)) {
        await this.prisma.transaction.create({
          data: {
            userId: trx.userId,
            type: trx.type,
            amount: trx.amount,
            date: today,
            categoryId: trx.categoryId,
            paymentMethod: trx.paymentMethod,
            note: `[Recurrente] ${trx.note ?? ''}`.trim(),
            isRecurring: false, // la copia generada NO es recurrente
          },
        });

        this.logger.log(
          `Transacción recurrente generada para usuario ${trx.userId} (${trx.type} - ${trx.amount})`
        );
      }
    }
  }

  private shouldGenerate(trx: any, today: Date): boolean {
    const trxDate = new Date(trx.date);

    switch (trx.recurrence) {
      case 'daily':
        return true;
      case 'weekly':
        return trxDate.getDay() === today.getDay();
      case 'biweekly': {
        const diff = Math.floor(
          (today.getTime() - trxDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diff % 14 === 0;
      }
      case 'monthly':
        return trxDate.getDate() === today.getDate();
      default:
        return false;
    }
  }
}
