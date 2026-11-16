import { createRouter } from "../utils/router";
import { UserController } from "../controllers/user.controllers";
import { validateBody } from "../middleware/validation.middleware";
import { createUserDto } from "../dto";

const router = createRouter();

const userController = new UserController();

router.post(
    "/create-user",
    validateBody(createUserDto),
    userController.createUser.bind(userController)
)

export default router