import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) { }

  // 🔹 Obtener planes disponibles
  @Get('plans')
  async getPlans() {
    return this.billingService.getPlans();
  }

  // 🔹 Cambiar de plan
  async upgrade(
    @Req() req,
    @Body() body: { planName: string; paymentMethod: string },
  ) {
    return this.billingService.upgradePlan(
      req.user.sub, // 👈 usamos el "sub" del JWT
      body.planName,
      body.paymentMethod,
    );
  }

   // ✅ Ver plan actual
  @Get('current-plan')
  async getCurrentPlan(@Req() req) {
    return this.billingService.getCurrentPlan(req.user.userId);
  }

  // ✅ Ver historial de pagos
  @Get('history')
  async getHistory(@Req() req) {
    return this.billingService.getPaymentHistory(req.user.userId);
  }


}
