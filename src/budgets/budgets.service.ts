import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CreateBudgetAlertDto } from './dto/create-budget-alert.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BudgetsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Crear presupuesto
  async create(userId: number, dto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        userId,
        type: dto.type,
        amount: dto.amount,
        categoryId: dto.categoryId || null,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
      },
    });
  }

  // Listar presupuestos del usuario
  async findAll(userId: number) {
    return this.prisma.budget.findMany({
      where: { userId },
      include: { alerts: true, category: true },
    });
  }

  // Ver un presupuesto específico
  async findOne(userId: number, id: number) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: { alerts: true, category: true },
    });
    if (!budget || budget.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a este presupuesto');
    }
    return budget;
  }

  // Actualizar presupuesto
  async update(userId: number, id: number, dto: UpdateBudgetDto) {
    const budget = await this.findOne(userId, id);
    return this.prisma.budget.update({
      where: { id: budget.id },
      data: {
        type: dto.type ?? budget.type,
        amount: dto.amount ?? budget.amount,
        categoryId: dto.categoryId ?? budget.categoryId,
        periodStart: dto.periodStart ? new Date(dto.periodStart) : budget.periodStart,
        periodEnd: dto.periodEnd ? new Date(dto.periodEnd) : budget.periodEnd,
      },
    });
  }

  // Eliminar presupuesto
  async remove(userId: number, id: number) {
    const budget = await this.findOne(userId, id);
    return this.prisma.budget.delete({ where: { id: budget.id } });
  }

  // Crear alerta
  async addAlert(userId: number, budgetId: number, dto: CreateBudgetAlertDto) {
    const budget = await this.findOne(userId, budgetId);
    return this.prisma.budgetAlert.create({
      data: {
        budgetId: budget.id,
        threshold: dto.threshold,
        message: dto.message || null,
      },
    });
  }

  // Actualizar alerta
  async updateAlert(userId: number, alertId: number, dto: CreateBudgetAlertDto) {
    const alert = await this.prisma.budgetAlert.findUnique({
      where: { id: alertId },
      include: { budget: true },
    });

    if (!alert || alert.budget.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta alerta');
    }

    return this.prisma.budgetAlert.update({
      where: { id: alertId },
      data: {
        threshold: dto.threshold ?? alert.threshold,
        message: dto.message ?? alert.message,
      },
    });
  }

  // Eliminar alerta
  async removeAlert(userId: number, alertId: number) {
    const alert = await this.prisma.budgetAlert.findUnique({
      where: { id: alertId },
      include: { budget: true },
    });

    if (!alert || alert.budget.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta alerta');
    }

    return this.prisma.budgetAlert.delete({
      where: { id: alertId },
    });
  }

  // ✅ Verificar alertas de un presupuesto
  async checkBudgetAlerts(budgetId: number) {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
      include: { alerts: true, category: true },
    });
    if (!budget) throw new ForbiddenException('Presupuesto no encontrado');

    // Sumar transacciones de tipo gasto en el rango
    const totalGastado = await this.prisma.transaction.aggregate({
      where: {
        userId: budget.userId,
        type: 'gasto',
        date: { gte: budget.periodStart, lte: budget.periodEnd },
        ...(budget.categoryId && { categoryId: budget.categoryId }),
      },
      _sum: { amount: true },
    });

    const gasto = totalGastado._sum.amount || 0;
    const porcentaje = (gasto / budget.amount) * 100;

    for (const alert of budget.alerts) {
      if (porcentaje >= alert.threshold) {
        await this.notificationsService.sendToUser(
          budget.userId,
          '⚠️ Alerta de presupuesto',
          alert.message || `Ya gastaste el ${alert.threshold}% de tu presupuesto`,
        );
      }
    }

    return { gasto, porcentaje, alerts: budget.alerts.length };
  }
}
