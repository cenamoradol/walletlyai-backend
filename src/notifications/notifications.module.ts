import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // 👈 necesario para usar PrismaService
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService], // 👈 por si quieres usarlo en BudgetsService
})
export class NotificationsModule {}
