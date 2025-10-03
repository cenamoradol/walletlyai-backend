import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RecurringService } from './recurring.service';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, RecurringService],
  exports: [TransactionsService], // 👈 solo exportamos TransactionsService
})
export class TransactionsModule {}
