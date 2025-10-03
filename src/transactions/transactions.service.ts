import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, dto: CreateTransactionDto) {
        const category = await this.prisma.category.findFirst({
            where: { id: dto.categoryId, userId },
        });

        if (!category) {
            throw new Error('Categoría no encontrada o no pertenece al usuario');
        }

        return this.prisma.transaction.create({
            data: {
                userId,
                type: dto.type,
                amount: dto.amount,
                date: new Date(dto.date), 
                categoryId: dto.categoryId,
                paymentMethod: dto.paymentMethod,
                note: dto.note,
                isRecurring: dto.isRecurring ?? false,
                recurrence: dto.recurrence,
                endDate: dto.endDate ? new Date(dto.endDate) : null,
            },
        });
    }

    async findAll(userId: number, from?: string, to?: string, type?: string, categoryId?: number) {
        return this.prisma.transaction.findMany({
            where: {
                userId,
                ...(type ? { type } : {}),
                ...(categoryId ? { categoryId } : {}),
                ...(from && to
                    ? { date: { gte: new Date(from), lte: new Date(to) } }
                    : from
                        ? { date: { gte: new Date(from) } }
                        : to
                            ? { date: { lte: new Date(to) } }
                            : {}),
            },
            orderBy: { date: 'desc' },
        });
    }

    async findOne(id: number, userId: number) {
        return this.prisma.transaction.findFirst({
            where: { id, userId },
        });
    }

    async update(id: number, userId: number, dto: UpdateTransactionDto) {
        return this.prisma.transaction.updateMany({
            where: { id, userId },
            data: {
                ...dto,
                date: dto.date ? new Date(dto.date) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            },
        });
    }

    async remove(id: number, userId: number) {
        return this.prisma.transaction.deleteMany({
            where: { id, userId },
        });
    }
}
