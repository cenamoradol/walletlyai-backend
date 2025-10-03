import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {
    if (!admin.apps.length) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('FIREBASE_PRIVATE_KEY is not defined in .env');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });


    }
  }

  async sendToUser(userId: number, title: string, body: string) {
    const tokens = await this.prisma.notificationToken.findMany({
      where: { userId },
    });

    if (tokens.length === 0) {
      this.logger.warn(`El usuario ${userId} no tiene tokens registrados`);
      return;
    }

    const messages = tokens.map((t) => ({
      token: t.token,
      notification: { title, body },
    }));

    try {
      const response = await admin.messaging().sendEach(messages);
      this.logger.log(`Enviadas ${response.successCount} notificaciones a user ${userId}`);
      return response;
    } catch (err) {
      this.logger.error('Error enviando notificaciones', err);
    }
  }
}
