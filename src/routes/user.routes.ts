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

router.get("/users",userController.getAllUser.bind(userController))
router.get("/:email",userController.getSingleUser.bind(userController))
router.patch("/:id", userController.updateSingleUser.bind(userController))
router.delete("/:firstName", userController.deleteSingleUser.bind(userController))

export default router