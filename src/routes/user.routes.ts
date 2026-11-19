import { createRouter } from "../utils/router";
import { UserController } from "../controllers/user.controllers";
import { validateBody } from "../middleware/validation.middleware";
import { createUserDto, updateUserDto } from "../dto";
import { authenticationMiddleware } from "../middleware/auth.middleware";
import { BcryptProvider } from "../global/hashing";

const router = createRouter();

const hashingProvider = new BcryptProvider();
const userController = new UserController(hashingProvider);

router.get(
  "/whoami",
  authenticationMiddleware,
  userController.whoami.bind(userController),
);

router.patch(
  "/update-profile",
  validateBody(updateUserDto),
  authenticationMiddleware,
  userController.updateSingleProfile.bind(userController),
);

router.delete(
  "/:password",
  authenticationMiddleware,
  userController.deleteProfile.bind(userController),
);

export default router;
