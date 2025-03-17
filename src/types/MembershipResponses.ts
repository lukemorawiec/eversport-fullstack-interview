interface GetMembershipResponse {
  membership: Membership;
  periods: Period[];
}

interface CreateMembershipResponse {
  membership: Membership;
  membershipPeriods: Period[];
}
