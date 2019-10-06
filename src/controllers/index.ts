import { IndexController } from "./IndexController";
import { UsersController } from "./users.controller";
import { AuthController } from "./auth.controller";


export const CONTROLLERS = [
    new AuthController(),
    new IndexController(),
    new UsersController()
];

