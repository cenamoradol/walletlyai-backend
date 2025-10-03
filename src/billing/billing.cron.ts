import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BillingService } from './billing.service';

@Injectable()
export class BillingCron {
  constructor(private billingService: BillingService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRenewals() {
    await this.billingService.renewSubscriptions();
  }
}
