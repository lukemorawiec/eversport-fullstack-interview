interface Membership {
  id: number;
  uuid: string;
  name: string;
  userId: number;
  recurringPrice: number;
  validFrom: string;
  validUntil: string;
  state: "active" | "pending" | "expired";
  assignedBy: string;
  paymentMethod: "credit card" | "cash" | null;
  billingInterval: "weekly" | "monthly" | "yearly";
  billingPeriods: number;
}
