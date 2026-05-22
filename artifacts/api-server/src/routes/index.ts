import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import accessRouter from "./access";
import ownerRouter from "./owner";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/chat", chatRouter);
router.use("/access", accessRouter);
router.use("/owner", ownerRouter);

export default router;
