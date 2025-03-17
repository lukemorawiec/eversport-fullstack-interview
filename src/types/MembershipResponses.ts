export interface GetMembershipResponse {
  membership: Membership;
  periods: Period[];
}

export interface CreateMembershipResponse {
  membership: Membership;
  membershipPeriods: Period[];
}
