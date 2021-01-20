import { Controller } from './controller.interface';
import { AuthencationController } from './authencation.controller';
import { UserController } from './user.controller';

/* Test server */
import { IndexController } from './index.controller';

export const CONTROLLERS: Controller[] = [
  new UserController(),
  new AuthencationController(),
  new IndexController()
];
