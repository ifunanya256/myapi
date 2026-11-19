import { createRouter } from "../utils/router";
import { UserController } from "../controllers/user.controllers";
import { validateBody } from "../middleware/validation.middleware";
import { createUserDto, updateUserDto } from "../dto";
import { authenticationMiddleware } from "../middleware/auth.middleware";

const router = createRouter();

const userController = new UserController();

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

export default router;
