import { AuthController } from "../controllers/auth.controller";
import { loginDto, signupDto } from "../dto/auth/auth.dto";
import { BcryptProvider } from "../global/hashing";
import { validateBody } from "../middleware/validation.middleware";
import { createRouter } from "../utils/router";

// const router = Router()
const router = createRouter();

const hashingProvider = new BcryptProvider();
const authController = new AuthController(hashingProvider);

router.post(
  "/signup",
  validateBody(signupDto),
  authController.signup.bind(authController),
);

router.post(
  "/login",
  validateBody(loginDto),
  authController.login.bind(authController),
);

export default router;
