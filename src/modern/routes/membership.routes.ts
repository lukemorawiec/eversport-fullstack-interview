import express, { Request, Response } from "express";
import { getAllMemberships } from "../services/get-memberships";
import { createMembership } from "../services/create-membership";

const router = express.Router();

router.get("/", (_, res: Response) => {
  const memberships = getAllMemberships();
  res.status(200).json(memberships);
});

router.post("/", (req: Request, res: Response) => {
  try {
    const result = createMembership(req.body);
    res.status(201).json(result);
  } catch (error) {
    res
      .status(400)
      .json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
  }
});

export default router;
