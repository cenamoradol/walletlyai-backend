import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.categoriesService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.categoriesService.findOne(req.user.userId, +id);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(req.user.userId, +id, dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.categoriesService.remove(req.user.userId, +id);
  }
}
