import { HomeController } from "../controllers/home.controller";
import { createRouter } from "../utils/router";

const router = createRouter();

const homeController = new HomeController();

router.get("/", homeController.home.bind(homeController));
router.get("/health", homeController.health.bind(homeController));

export default router;
