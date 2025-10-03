export class UpdateBudgetDto {
  type?: 'mensual' | 'quincenal';
  amount?: number;
  categoryId?: number;
  periodStart?: string;
  periodEnd?: string;
}
