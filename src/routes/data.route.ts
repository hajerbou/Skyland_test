import { Router } from "express";
import {
  getUsersTresure,
  addTresureToUser,
  createTreasure,
} from "../controllers/data.controller";

const router = Router();

router.get("/tresures", getUsersTresure);
router.post("/tresures/:tresureId", addTresureToUser);
router.post("/tresures", createTreasure);
export { router as dataRouter };
