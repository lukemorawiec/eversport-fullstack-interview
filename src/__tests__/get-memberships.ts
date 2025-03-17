import request from "supertest";
import { app } from "../server";
import { GetMembershipResponse } from "../types/MembershipResponses";

let server: any;

beforeAll(() => {
  server = app.listen(4001);
});

afterAll((done) => {
  server.close(done);
});

describe("GET /memberships", () => {
  it("responds with json (legacy endpoint)", (done) => {
    request(app)
      .get("/legacy/memberships")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  it("should responds with proper period for membership id: 1", async () => {
    const response = await request(app).get("/legacy/memberships");

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
  });

  it("should return the same response from legacy and new endpoint", async () => {
    const legacyResponse = await request(app).get("/legacy/memberships");

    const newResponse = await request(app).get("/memberships");

    expect(legacyResponse.status).toBe(200);
    expect(newResponse.status).toBe(200);

    expect(newResponse.body).toEqual(legacyResponse.body);
  });
});
