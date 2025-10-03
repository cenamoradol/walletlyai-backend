import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // ✅ Registrar token
  @Post('register-token')
  async registerToken(@Req() req, @Body() dto: { token: string }) {
    return this.prisma.notificationToken.create({
      data: {
        userId: req.user.userId,
        token: dto.token,
      },
    });
  }

  // ✅ Enviar notificación de prueba
  @Post('test')
  async testNotification(
    @Req() req,
    @Body() dto: { title: string; body: string },
  ) {
    return this.notificationsService.sendToUser(
      req.user.userId,
      dto.title,
      dto.body,
    );
  }
}
