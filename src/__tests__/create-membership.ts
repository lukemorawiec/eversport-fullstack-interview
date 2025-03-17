import request from "supertest";
import { app } from "../server";
import { Server } from "http";
import { CreateMembershipResponse } from "../types/MembershipResponses";
import { Period } from "../types/Period";

let server: Server;

beforeAll(() => {
  server = app.listen(4000);
});

afterAll((done) => {
  server.close(done);
});

describe("POST /legacy/memberships", () => {
  const validMembership = {
    name: "Gold Plan",
    recurringPrice: 150,
    paymentMethod: "credit card",
    billingInterval: "monthly",
    billingPeriods: 12,
    validFrom: "2023-01-01",
  };

  it("creates a new membership successfully", async () => {
    const response = await request(app)
      .post("/legacy/memberships")
      .set("Accept", "application/json")
      .send(validMembership);

    expect(response.status).toBe(201);
    expect(response.body.membership).toBeDefined();
  });

  it("returns 400 when mandatory fields are missing", async () => {
    const response = await request(app)
      .post("/legacy/memberships")
      .set("Accept", "application/json")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("missingMandatoryFields");
  });

  it("returns 400 for negative recurring price", async () => {
    const response = await request(app)
      .post("/legacy/memberships")
      .set("Accept", "application/json")
      .send({ ...validMembership, recurringPrice: -10 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("negativeRecurringPrice");
  });

  it("returns 400 for cash payment when price is below 100", async () => {
    const response = await request(app)
      .post("/legacy/memberships")
      .set("Accept", "application/json")
      .send({ ...validMembership, recurringPrice: 90, paymentMethod: "cash" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("cashPriceBelow100");
  });

  it("returns 400 when billingPeriods exceed allowed limit for monthly", async () => {
    const response = await request(app)
      .post("/legacy/memberships")
      .set("Accept", "application/json")
      .send({ ...validMembership, billingPeriods: 13 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("billingPeriodsMoreThan12Months");
  });

  it("returns 400 when billingPeriods is below the minimum for monthly", async () => {
    const response = await request(app)
      .post("/legacy/memberships")
      .set("Accept", "application/json")
      .send({ ...validMembership, billingPeriods: 5 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("billingPeriodsLessThan6Months");
  });

  it("returns 400 for billing periods more than 10 years", async () => {
    const response = await request(app)
      .post("/legacy/memberships")
      .set("Accept", "application/json")
      .send({
        ...validMembership,
        billingInterval: "yearly",
        billingPeriods: 11,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("billingPeriodsMoreThan10Years");
  });

  it("returns 400 for billing periods less than 3 years", async () => {
    const response = await request(app)
      .post("/legacy/memberships")
      .set("Accept", "application/json")
      .send({
        ...validMembership,
        billingInterval: "yearly",
        billingPeriods: 2,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("billingPeriodsLessThan3Years");
  });

  it("returns 400 for invalid billing interval", async () => {
    const response = await request(app)
      .post("/legacy/memberships")
      .set("Accept", "application/json")
      .send({ ...validMembership, billingInterval: "daily" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("invalidBillingPeriods");
  });

  it("returns 500 for server error (unexpected exception)", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(global, "Date").mockImplementation(() => {
      throw new Error("Unexpected server error");
    });

    const response = await request(app)
      .post("/legacy/memberships")
      .set("Accept", "application/json")
      .send(validMembership);

    expect(response.status).toBe(500);
    jest.restoreAllMocks();
  });
});

describe("POST /legacy/memberships vs POST /memberships", () => {
  const validMembership = {
    name: "Gold Plan",
    recurringPrice: 150,
    paymentMethod: "credit card",
    billingInterval: "monthly",
    billingPeriods: 12,
    validFrom: "2023-01-01",
  };

  const endpoints = [
    { name: "legacy", url: "/legacy/memberships" },
    { name: "modern", url: "/memberships" },
  ];

  endpoints.forEach(({ name, url }) => {
    describe(`${name} endpoint`, () => {
      it("creates a new membership successfully", async () => {
        const response = await request(app)
          .post(url)
          .set("Accept", "application/json")
          .send(validMembership);

        expect(response.status).toBe(201);
        expect(response.body.membership).toBeDefined();
      });
    });
  });

  it("returns the same response for legacy and modern endpoints", async () => {
    const legacyResponse = await request(app)
      .post("/legacy/memberships")
      .set("Accept", "application/json")
      .send(validMembership);

    const modernResponse = await request(app)
      .post("/memberships")
      .set("Accept", "application/json")
      .send(validMembership);

    expect(modernResponse.status).toBe(legacyResponse.status);
    
    const normalizeResponse = (response: CreateMembershipResponse) => ({
      validFrom: response.membership.validFrom,
      validUntil: response.membership.validUntil,
      membershipPeriods: response.membershipPeriods.map((p: Period) => ({
        start: p.start,
        end: p.end,
        state: p.state,
      })),
    });

    expect(normalizeResponse(legacyResponse.body)).toEqual(
      normalizeResponse(modernResponse.body)
    );
  });
});
