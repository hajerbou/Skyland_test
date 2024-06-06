import Express from "express";
import { login, signup, verify } from "../controllers/auth.controller";

const router = Express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/verify/:token", verify);

export { router as authRouter };
