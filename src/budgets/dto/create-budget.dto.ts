export class CreateBudgetDto {
  type: 'mensual' | 'quincenal';
  amount: number;
  categoryId?: number;
  periodStart: string; // ISO string
  periodEnd: string;   // ISO string
}
