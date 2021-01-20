import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { DataStoredInToken } from '../services/authencation.service';
import { userService } from '../services/user.service';
import { environment } from '../environment';

import { Unauthorized, Forbidden } from '../errors';
import { User, UserRole } from '../entity/user';

export const authorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Lấy Token từ Header ra
  const jwtToken = req.header(environment.TOKEN_HEADER) || '';

  if (!jwtToken) {
    // undefined
    next(new Unauthorized('Authentication Token missing!'));
    return;
  }

  // Verify token
  try {
    const payload = jwt.verify(
      jwtToken,
      environment.TOKEN_KEY
    ) as DataStoredInToken;

    res.locals.payload = payload;

    /** Tạo mới token khi sắp hệt hạn
     * if (Date.now() >= payload.exp * 1000) {
     *   return false;
     * }
     * => có thể để client tự lấy khi sắp hêt time
     */
    next(); //  Authencation success
  } catch (error) {
    // token invalid
    next(new Unauthorized());
    return;
  }
};

/**
 * Có thể có nhiều Roles để check
 * @param roles Array
 */
export const checkRole = (roles: Array<UserRole>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Lấy UserId trong payload
    const { userId } = res.locals.payload;

    // có thể dùng role luôn nhưng vì tính quan trọng nên check lại
    let user: User;
    try {
      user = await userService.getById(userId);
    } catch (error) {
      next(new Unauthorized());
      return;
    }

    if (roles.indexOf(user.role) > -1) {
      next();
    } else {
      next(new Forbidden());
    }
  };
};
