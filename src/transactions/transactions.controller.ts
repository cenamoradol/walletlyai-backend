import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OwnershipGuard } from '../common/guards/ownership.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(
    @Req() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('type') type?: string,
    @Query('categoryId') categoryId?: number,
  ) {
    return this.transactionsService.findAll(req.user.userId, from, to, type, categoryId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.transactionsService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(+id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.transactionsService.remove(+id, req.user.userId);
  }
}
