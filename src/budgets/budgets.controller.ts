import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CreateBudgetAlertDto } from './dto/create-budget-alert.dto';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.budgetsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.budgetsService.findOne(req.user.userId, Number(id));
  }

  @Put(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateBudgetDto) {
    return this.budgetsService.update(req.user.userId, Number(id), dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.budgetsService.remove(req.user.userId, Number(id));
  }

  @Post(':id/alerts')
  addAlert(@Req() req, @Param('id') id: string, @Body() dto: CreateBudgetAlertDto) {
    return this.budgetsService.addAlert(req.user.userId, Number(id), dto);
  }

  @Put('alerts/:alertId')
  updateAlert(@Req() req, @Param('alertId') alertId: string, @Body() dto: CreateBudgetAlertDto) {
    return this.budgetsService.updateAlert(req.user.userId, Number(alertId), dto);
  }

  @Delete('alerts/:alertId')
  removeAlert(@Req() req, @Param('alertId') alertId: string) {
    return this.budgetsService.removeAlert(req.user.userId, Number(alertId));
  }

  // ✅ Endpoint para verificar alertas de un presupuesto
  @Get(':id/check')
  checkAlerts(@Param('id') id: string) {
    return this.budgetsService.checkBudgetAlerts(Number(id));
  }
}
