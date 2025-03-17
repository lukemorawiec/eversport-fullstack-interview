import memberships from "../../data/memberships.json";
import membershipPeriods from "../../data/membership-periods.json";
import { GetMembershipResponse } from "../../types/MembershipResponses";

export const getAllMemberships = (): GetMembershipResponse[] => {
  return memberships.map((membership) => {
    const periods = membershipPeriods.filter(
      (p) => p.membership === membership.id
    );
    return { membership, periods };
  });
};
