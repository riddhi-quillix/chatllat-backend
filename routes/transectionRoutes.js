import express from "express";
import { getEscrowTransection } from "../controllers/transectionController.js";
const router = express.Router();

router.get("/escrowTransection", getEscrowTransection);

export default router;
