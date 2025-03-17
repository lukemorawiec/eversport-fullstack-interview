import request from "supertest";
import { app } from "../server";

let server: any;

beforeAll(() => {
  server = app.listen(4001);
});

afterAll((done) => {
  server.close(done);
});

describe("GET /legacy/memberships", () => {
  it("responds with json", (done) => {
    request(app)
      .get("/legacy/memberships")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  it("responds with proper period for membership id: 1", async () => {
    const response = await request(app)
      .get("/legacy/memberships")
      .set("Accept", "application/json");

    const memberships: GetMembershipResponse[] = response.body;

    const foundMembership = memberships.find(
      ({ membership }) => membership.id === 1
    );

    expect(foundMembership).toBeDefined();
    expect(foundMembership?.membership.id).toEqual(1);

    const foundMembershipFirstPeriod = foundMembership?.periods[0];

    expect(foundMembershipFirstPeriod?.id).toEqual(1);
    expect(foundMembershipFirstPeriod?.uuid).toEqual(
      "123e4567-e89b-12d3-a456-426614174000"
    );
    expect(foundMembershipFirstPeriod?.start).toEqual("2023-01-01");
  });
});
