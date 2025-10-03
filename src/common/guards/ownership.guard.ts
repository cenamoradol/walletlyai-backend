import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const { params, route } = request;

    // Determinar el recurso según la ruta
    if (route.path.includes('transactions/:id')) {
      const trx = await this.prisma.transaction.findUnique({
        where: { id: Number(params.id) },
      });
      if (!trx || trx.userId !== userId) {
        throw new ForbiddenException('No tienes acceso a este recurso');
      }
    }

    if (route.path.includes('budgets/:id')) {
      const budget = await this.prisma.budget.findUnique({
        where: { id: Number(params.id) },
      });
      if (!budget || budget.userId !== userId) {
        throw new ForbiddenException('No tienes acceso a este recurso');
      }
    }

    if (route.path.includes('categories/:id')) {
      const category = await this.prisma.category.findUnique({
        where: { id: Number(params.id) },
      });
      if (!category || category.userId !== userId) {
        throw new ForbiddenException('No tienes acceso a este recurso');
      }
    }

    return true;
  }
}
