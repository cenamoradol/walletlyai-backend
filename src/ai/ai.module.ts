import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [PrismaModule, TransactionsModule], // 👈 ahora AiModule puede usar TransactionsService
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
