interface Membership {
  id: number;
  uuid: string;
  name: string;
  userId: number;
  recurringPrice: number;
  validFrom: string;
  validUntil: string;
  state: string;
  assignedBy: string;
  paymentMethod: string | null;
  billingInterval: string;
  billingPeriods: number;
}
