import { Controller } from './controller.interface';
import { HttpServer } from '../server/http-server';
import { Response, Request, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { environment } from '../environment';

// Errors
import { Forbidden, PreconditionFailed, Unauthorized } from '../errors';

// Import Services
import { User } from '../entity/user';
import {
  authencationService,
  DataStoredInToken
} from '../services/authencation.service';
// Middelwares
import { authorization } from '../middlewares/auth.middleware';

export class AuthencationController implements Controller {
  // URL luôn là số nhiều
  private router = environment.API_URL + '/auth';
  private ID_PATTERN = '[0-9a-fA-F]{24}';

  init(httpServer: HttpServer): void {
    // Login
    httpServer.post(`${this.router}`, this.login.bind(this));

    // refresh Token vs get
    httpServer.get(
      `${this.router}/:id(${this.ID_PATTERN})`,
      authorization.bind(this),
      this.newToken.bind(this)
    );

    httpServer.put(
      `${this.router}/:id(${this.ID_PATTERN})`,
      authorization.bind(this),
      this.changePassword.bind(this)
    );
    // Update email... có thể dùng PATCH
    httpServer.put(
      `${this.router}/:id(${this.ID_PATTERN})/edit`,
      authorization.bind(this),
      this.update.bind(this)
    );
  }

  private async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // lấy username và password ra
    const { username, password } = req.body;
    // kiểm tra có rỗng ko
    if (!(username && password)) {
      next(new Unauthorized('Invalid authentication credentials provided!'));
      return;
    }
    try {
      const token = await authencationService.login(username, password);
      // chuyển về client
      res.setHeader(environment.TOKEN_HEADER, token);
      res.status(200).json({ message: token });
    } catch (error) {
      next(error);
    }
  }

  private async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // kiểm tra Input
    const {
      body: { password, newpassword },
      params: { id }
    } = req;

    if (!(password && newpassword) || password === newpassword) {
      next(new PreconditionFailed('Password'));
      return;
    }
    const { userId } = res.locals.payload as DataStoredInToken;

    if (id !== userId) {
      // xác định chính chủ ko
      next(new Forbidden());
      return;
    }
    // validate new Password
    const user = new User();
    user.password = newpassword;
    const validErrors = await validate(user, {
      skipMissingProperties: true
    });
    if (validErrors.length > 0) {
      const invalid = new PreconditionFailed();
      invalid.message = validErrors
        .map(
          (error: ValidationError) =>
            error.constraints && Object.values(error.constraints)
        )
        .join(', ');

      next(invalid);
      return;
    }

    try {
      await authencationService.changPassword(userId, password, newpassword);
      res.status(200).json({ message: 'successfully' });
    } catch (error) {
      next(error);
    }
  }

  private async newToken(req: Request, res: Response, next: NextFunction) {
    res.json({ message: 'Tạo mới token' });
  }

  private async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const {
      body: { email },
      params: { id }
    } = req;

    res.json({ message: `${email} : ${id}` });
  }
}
