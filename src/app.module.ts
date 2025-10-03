import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PlansModule } from './plans/plans.module';
import { BillingModule } from './billing/billing.module';
import { CreditsModule } from './credits/credits.module';
import { BudgetsModule } from './budgets/budgets.module';
import { ReportsModule } from './reports/reports.module';
import { AiModule } from './ai/ai.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), AuthModule, UsersModule, TransactionsModule, PlansModule, BillingModule, CreditsModule, BudgetsModule, ReportsModule, AiModule, NotificationsModule, CategoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
