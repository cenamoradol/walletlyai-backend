import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) { }

  // ✅ Balance general en un rango de fechas
  async getBalance(userId: number, start: Date, end: Date) {
    const ingresos = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'ingreso',
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    const gastos = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'gasto',
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    return {
      ingresos: ingresos._sum.amount || 0,
      gastos: gastos._sum.amount || 0,
      balance: (ingresos._sum.amount || 0) - (gastos._sum.amount || 0),
    };
  }

  // ✅ Reporte por categoría
  async getByCategory(userId: number, start: Date, end: Date) {
    const data = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    // Traemos los nombres de categorías
    const categories = await this.prisma.category.findMany({
      where: { userId },
    });

    return data.map((d) => ({
      categoryId: d.categoryId,
      category: categories.find((c) => c.id === d.categoryId)?.name || 'Desconocido',
      total: d._sum.amount || 0,
    }));
  }

  // ✅ Tendencia mensual (agrupado por mes)
  async getTrend(userId: number, start: Date, end: Date) {
    const data = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      select: {
        type: true,
        amount: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });

    const trend: Record<string, { ingresos: number; gastos: number }> = {};

    for (const trx of data) {
      const key = `${trx.date.getFullYear()}-${(trx.date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;

      if (!trend[key]) trend[key] = { ingresos: 0, gastos: 0 };

      if (trx.type === 'ingreso') {
        trend[key].ingresos += trx.amount;
      } else {
        trend[key].gastos += trx.amount;
      }
    }

    return Object.entries(trend).map(([periodo, valores]) => ({
      periodo,
      ingresos: valores.ingresos,
      gastos: valores.gastos,
      balance: valores.ingresos - valores.gastos,
    }));
  }

  async getDashboard(userId: number, start: Date, end: Date) {
    const balance = await this.getBalance(userId, start, end);
    const categories = await this.getByCategory(userId, start, end);
    const trend = await this.getTrend(userId, start, end);

    return {
      balance,
      categories,
      trend,
    };
  }
}
