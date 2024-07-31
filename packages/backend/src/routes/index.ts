import bodyParserMiddleware from "@/middleware/parse-body";
import { RateLimiterMiddleware } from "@/middleware/rate-limiter";
import { AuthenticationMiddleware } from "@/middleware/session";
import { Hono } from "hono";
import userRouter from "./user";
import authRouter from "./auth";

const router = new Hono();

// MIDDLEWARES
router.use("*", bodyParserMiddleware);
router.use("*", RateLimiterMiddleware);
router.use("*", AuthenticationMiddleware);

router.route("/auth", authRouter);
router.route("/user", userRouter);
export default router;
