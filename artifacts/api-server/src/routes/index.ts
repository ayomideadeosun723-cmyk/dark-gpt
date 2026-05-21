import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import authRouter from "./auth";
import accessRouter from "./access";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/chat", chatRouter);
router.use("/auth", authRouter);
router.use("/access", accessRouter);

export default router;
