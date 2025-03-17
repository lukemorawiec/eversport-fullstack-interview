import { v4 as uuidV4 } from "uuid";
import memberships from "../../data/memberships.json";
import membershipPeriods from "../../data/membership-periods.json";
import { formatDate } from "../../helpers/formatDate";
import { CreateMembershipPayload } from "../../types/CreateMembershipPayload";
import { Membership } from "../../types/Membership";
import { Period } from "../../types/Period";
import { CreateMembershipResponse } from "../../types/MembershipResponses";

export const createMembership = (
  data: CreateMembershipPayload
): CreateMembershipResponse => {
  if (!data.name || !data.recurringPrice) {
    throw new Error("missingMandatoryFields");
  }
  if (data.recurringPrice < 0) {
    throw new Error("negativeRecurringPrice");
  }
  if (data.recurringPrice < 100 && data.paymentMethod === "cash") {
    throw new Error("cashPriceBelow100");
  }
  if (
    data.billingInterval === "monthly" &&
    (data.billingPeriods > 12 || data.billingPeriods < 6)
  ) {
    throw new Error(
      data.billingPeriods > 12
        ? "billingPeriodsMoreThan12Months"
        : "billingPeriodsLessThan6Months"
    );
  }
  if (
    data.billingInterval === "yearly" &&
    (data.billingPeriods > 10 || data.billingPeriods < 3)
  ) {
    throw new Error(
      data.billingPeriods > 10
        ? "billingPeriodsMoreThan10Years"
        : "billingPeriodsLessThan3Years"
    );
  }

  const validFrom = data.validFrom ? new Date(data.validFrom) : new Date();
  const validUntil = new Date(validFrom);
  if (data.billingInterval === "monthly")
    validUntil.setMonth(validFrom.getMonth() + data.billingPeriods);
  if (data.billingInterval === "yearly")
    validUntil.setMonth(validFrom.getMonth() + data.billingPeriods * 12);
  if (data.billingInterval === "weekly")
    validUntil.setDate(validFrom.getDate() + data.billingPeriods * 7);

  const membership: Membership = {
    id: memberships.length + 1,
    uuid: uuidV4(),
    name: data.name,
    state: "expired",
    validFrom: formatDate(validFrom),
    validUntil: formatDate(validUntil),
    userId: 2000,
    assignedBy: "Admin",
    paymentMethod: data.paymentMethod,
    recurringPrice: data.recurringPrice,
    billingPeriods: data.billingPeriods,
    billingInterval: data.billingInterval,
  };

  memberships.push(membership);

  const periods: Period[] = [];
  let periodStart = validFrom;
  for (let i = 0; i < data.billingPeriods; i++) {
    const start = periodStart;
    const end = new Date(start);
    if (data.billingInterval === "monthly") {
      end.setMonth(start.getMonth() + 1);
    }
    if (data.billingInterval === "yearly") {
      end.setMonth(start.getMonth() + 12);
    }
    if (data.billingInterval === "weekly") {
      end.setDate(start.getDate() + 7);
    }

    periods.push({
      id: i + 1,
      uuid: uuidV4(),
      membership: membership.id,
      start: formatDate(start),
      end: formatDate(end),
      state: "planned",
    });
    periodStart = end;
  }
  membershipPeriods.push(...periods);
  return { membership, membershipPeriods: periods };
};
