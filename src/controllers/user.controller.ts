import { Controller } from './controller.interface';
import { HttpServer } from '../server/http-server';
import { Response, Request, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';

import { environment } from '../environment';

// Errors
import { PreconditionFailed } from '../errors';
import { HttpError } from '../errors/http-error';

// Import Services
import { userService } from '../services/user.service';
import { User, UserRole } from '../entity/user';

// Middelwares
import { authorization, checkRole } from '../middlewares/auth.middleware';

export class UserController implements Controller {
  // URL luôn là số nhiều
  private router = environment.API_URL + '/users';
  private ID_PATTERN = '[0-9a-fA-F]{24}';

  init(httpServer: HttpServer): void {
    // Read Alle : dành tất cả
    httpServer.get(`${this.router}`, this.getAll.bind(this));

    // Read One = id: dành cho tất cả
    httpServer.get(
      `${this.router}/:id(${this.ID_PATTERN})`,
      this.getById.bind(this)
    );

    // Create new : dành cho tất cả
    httpServer.post(`${this.router}`, this.create.bind(this));

    // Update One = id
    httpServer.put(
      `${this.router}/:id(${this.ID_PATTERN})`,
      authorization.bind(this),
      checkRole.call(this, [UserRole.ADMIN]),
      this.update.bind(this)
    );

    // delete One = id: chỉ có admin
    httpServer.delete(
      `${this.router}/:id(${this.ID_PATTERN})`,
      authorization.bind(this),
      checkRole.call(this, [UserRole.ADMIN]),
      this.remove.bind(this)
    );
  }

  private async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.json(await userService.getAll());
      // xử lý thêm lỗi ko có Resource => tùy vào Client
    } catch (error) {
      // Lỗi đến từ Service = truy vấn Database
      next(error);
    }
  }

  private async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Kiểm tra ID <= oki vì dùng regexp
    try {
      res.json(await userService.getById(req.params.id));
    } catch (error) {
      next(error);
    }
  }

  private async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Lấy form từ req ra => Tạo User tương ứng
    const { username, password } = req.body;
    const newUser = new User();
    newUser.username = username;
    newUser.password = password;
    newUser.role = UserRole.GHOST; // chỉ admin dc xét

    // Validate
    const invalid = await this.validate(newUser);
    if (invalid) {
      next(invalid);
      return;
    }

    newUser.hashPassword();
    // gọi Service => Chuyển dữ liệu về Client
    try {
      await userService.create(newUser);
      // thiết kế lại cách trả về
      res.status(200).json({ mesage: 'User saved Successfully' });
    } catch (error) {
      // Gửi luôn về. Lỗi xử lý tại errorHandler
      next(error);
    }
  }

  private async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // Lấy từ req những thành phần được update
    const { password, role } = req.body;
    const updateUser = new User();
    if (password) {
      // tránh User { password: undefined}
      updateUser.password = '' + password;
    }
    updateUser.role = role || UserRole.GHOST;

    // Validate
    const invalid = await this.validate(updateUser, {
      skipMissingProperties: true
    });
    if (invalid) {
      next(invalid);
      return;
    }
    updateUser.hashPassword();
    try {
      // ko Được đưa userId vào vì lỗi của Typeorm vs moongodb
      if (await userService.update(req.params.id, updateUser)) {
        res.status(200).json({ mesage: 'User update Successfully' });
      } else {
        res.status(200).json({ mesage: 'Update Nothing!' });
      }
    } catch (error) {
      next(error);
    }
  }

  private async remove(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const id = req.params.id;

    try {
      if (await userService.delete(id)) {
        res.status(200).json({ mesage: 'Delete Successfully' });
      } else {
        res.status(200).json({ mesage: 'Delete Nothing' });
      }
    } catch (error) {
      next(error);
    }
  }

  private async validate(user: User, opt = {}): Promise<HttpError | undefined> {
    const validErrors = await validate(user, opt);

    if (validErrors.length > 0) {
      const invalid = new PreconditionFailed();
      invalid.message = validErrors
        .map(
          (error: ValidationError) =>
            error.constraints && Object.values(error.constraints)
        )
        .join(', ');

      return invalid;
    } else {
      return undefined;
    }
  }
}
