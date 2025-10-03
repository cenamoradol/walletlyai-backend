import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: number, id: number) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async update(userId: number, id: number, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.updateMany({
      where: { id, userId },
      data: dto,
    });
    if (!category.count) throw new NotFoundException('Categoría no encontrada');
    return this.findOne(userId, id);
  }

  async remove(userId: number, id: number) {
    const deleted = await this.prisma.category.deleteMany({
      where: { id, userId },
    });
    if (!deleted.count) throw new NotFoundException('Categoría no encontrada');
    return { message: 'Categoría eliminada' };
  }
}
