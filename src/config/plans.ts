/* Subscription plans. SAMPLE prices in NGN. Real purchases go through App Store / Google Play billing. */
export type PlanId = 'month' | 'quarter' | 'year';

export const PLANS: { id: PlanId; name: string; price: string; per: string; total: string; tag?: string }[] = [
  { id: 'month', name: 'Monthly', price: '₦2,500', per: 'per month', total: 'Billed ₦2,500 every month' },
  { id: 'quarter', name: '3 months', price: '₦6,500', per: '₦2,167 a month', total: 'Billed ₦6,500 every 3 months', tag: 'Save 13%' },
  { id: 'year', name: '12 months', price: '₦22,000', per: '₦1,833 a month', total: 'Billed ₦22,000 every year', tag: 'Save 27%' },
];
