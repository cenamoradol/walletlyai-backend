import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BillingCron } from './billing.cron';

@Module({
  imports: [PrismaModule],
  providers: [BillingService, BillingCron], // 👈 añadimos el cron
  controllers: [BillingController],
  exports: [BillingService],
})
export class BillingModule {}
