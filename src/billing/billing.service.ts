import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) { }

  // ✅ Planes disponibles
  async getPlans() {
    return this.prisma.subscriptionPlan.findMany();
  }

  // ✅ Asignar plan Free al registrarse
  async assignDefaultPlan(userId: number) {
    const freePlan = await this.prisma.subscriptionPlan.findUnique({
      where: { name: 'Free' },
    });

    if (!freePlan) {
      throw new ForbiddenException('El plan Free no está configurado en la base de datos');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        plan: freePlan.name,
        credits: freePlan.monthlyCredits,
        subscriptionExpires: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 mes
        showAds: freePlan.showAds,
      },
    });
  }

  // ✅ Cambiar de plan (ej. Plus, Expert, Pro)
  async upgradePlan(userId: number, planName: string, paymentMethod: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { name: planName },
    });

    if (!plan) throw new ForbiddenException('El plan seleccionado no existe.');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('Usuario no encontrado.');

    // Actualizar datos del usuario
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        plan: plan.name,
        credits: plan.monthlyCredits === -1 ? 999999 : plan.monthlyCredits,
        subscriptionExpires: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        showAds: plan.showAds,
      },
    });

    // Registrar el pago
    await this.prisma.paymentHistory.create({
      data: {
        userId,
        planName: plan.name,
        description: `Membresía del ${plan.name}`,
        paymentMethod,
        amount: plan.price,
        currency: 'USD',
      },
    });

    return updatedUser;
  }

  // ✅ Renovación automática (para cron job)
  async renewSubscriptions() {
    const now = new Date();

    const users = await this.prisma.user.findMany({
      where: {
        subscriptionExpires: { lte: now },
      },
    });

    let count = 0;

    for (const user of users) {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { name: user.plan },
      });

      if (!plan) continue;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          credits: plan.monthlyCredits === -1 ? 999999 : plan.monthlyCredits,
          subscriptionExpires: new Date(
            new Date().setMonth(new Date().getMonth() + 1),
          ),
        },
      });

      count++;
    }

    return { renewed: count };
  }
  // ✅ Historial de pagos de un usuario
  async getCurrentPlan(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { payments: true },
    });

    if (!user) return null;

    return {
      plan: user.plan,
      credits: user.credits,
      subscriptionExpires: user.subscriptionExpires,
      showAds: user.showAds,
    };
  }

  // ✅ Historial de pagos del usuario
  async getPaymentHistory(userId: number) {
    return this.prisma.paymentHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
