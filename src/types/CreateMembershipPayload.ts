export interface CreateMembershipPayload {
  name: string;
  recurringPrice: number;
  paymentMethod: string | null;
  billingPeriods: number;
  billingInterval: "monthly" | "yearly" | "weekly";
  validFrom?: string;
}
