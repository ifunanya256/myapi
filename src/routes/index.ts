import { Router  } from "express";
import userRoutes from "./user.routes"
import authRoutes from "./auth.routes"
import homeRoutes from './home.routes'

const router = Router()

router.use ("/home", homeRoutes)
router.use("/auth", authRoutes)
router.use("/user", userRoutes)

export default router
