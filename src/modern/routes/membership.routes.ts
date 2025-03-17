import express, { Request, Response } from "express";
import { getAllMemberships } from "../services/get-memberships";

const router = express.Router();

router.get("/", (_, res: Response) => {
  const memberships = getAllMemberships();
  res.status(200).json(memberships);
});

router.post("/", (req: Request, res: Response) => {
  throw new Error("not implemented");
});

export default router;
