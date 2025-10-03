import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('balance')
  getBalance(@Req() req, @Query('start') start: string, @Query('end') end: string) {
    return this.reportsService.getBalance(req.user.userId, new Date(start), new Date(end));
  }

  @Get('categories')
  getByCategory(@Req() req, @Query('start') start: string, @Query('end') end: string) {
    return this.reportsService.getByCategory(req.user.userId, new Date(start), new Date(end));
  }

  @Get('trend')
  getTrend(@Req() req, @Query('start') start: string, @Query('end') end: string) {
    return this.reportsService.getTrend(req.user.userId, new Date(start), new Date(end));
  }

  @Get('dashboard')
  getDashboard(@Req() req, @Query('start') start: string, @Query('end') end: string) {
    return this.reportsService.getDashboard(req.user.userId, new Date(start), new Date(end));
  }

}
