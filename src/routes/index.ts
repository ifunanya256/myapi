import { Router  } from "express";
import userRoutes from "./user.routes"
import authRoutes from "./auth.routes"

const router = Router()

router.use("/auth", authRoutes)
router.use("/user", userRoutes)

export default router
