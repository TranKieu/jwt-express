import { Controller } from './Controller';
import { HttpServer } from '../server/HttpServer';
import { Response, Request, NextFunction } from 'express';
import { Environment } from '../environment';
import { authService, DataStoredInToken } from '../services/auth.service';
import { InvalidAuthentication } from '../errors/invalid.authentication.error';
import { BadRequest } from '../errors/badrequest.error';
import { Unauthorized } from '../errors/unauthorized.error';
import { authorization } from '../middlewares/auth.middleware';
import { MethodNotAllowed } from '../errors/methodnotallowed.error';
// Service

export class AuthController implements Controller {

  private router = Environment.getVersion() + '/auths';
  private xTokenKey = Environment.getTokenHeaderKey();

  init(httpServer: HttpServer): void {
    // Login
    httpServer.post(`${this.router}`, this.login.bind(this));

    // change password, Phải kiểm tra mới có Payload
    httpServer.put(
      `${this.router}`, this.changPassword.bind(this)
    );

  }

  /** Các bước thực hiện:
   *   + Kiểm tra dữ liệu đầu vào
   *   + lấy dữ liệu từ Service vs dữ liệu => trycatch
   *   + gửi về Client Data oder next(Exception)
   */

  // login
  private async login(
    req: Request, res: Response, next: NextFunction
  ): Promise<void> {
    // kiểm tra xem username != password
    let { username, password } = req.body;
    // Kiểm tra xem có rỗng ko
    if (!(username && password)) {
      next(new InvalidAuthentication());
      return; // phải có nếu ko nó vẫn chạy
    }

    try {

      // phòng trường hợp cần sử dụng jwtPayload
      let { token, jwtPayload } = await authService.login(username, password);

      res.setHeader(this.xTokenKey, token);
      res.locals.jwtPayload = jwtPayload;
      res.status(200).json({ 'X-token': token });
    } catch (error) {
      next(error);
    }
  }

  /**
   *  Chú ý: Phải sử dụng middleware authorization trước nó
   */
  private async changPassword(
    req: Request, res: Response, next: NextFunction
  ): Promise<void> {

    // Lấy dữ liệu từ body
    const { oldPassword, newPassword } = req.body;

    // kiểm tra 
    if (!(oldPassword && newPassword)) {
      next(new BadRequest());
      return;
    }

    let jwtPayload = res.locals.jwtPayload as DataStoredInToken;

    if (jwtPayload === undefined) {
      /**
       * Luôn phải sử dụng middleware authorization 
       *  => thì mới có res.locals.jwtPayload
       * */

      next(new Unauthorized());
      return;
    }

    try {
      // gọi service ra
      await authService
        .changePassword(jwtPayload.userId, oldPassword, newPassword);
      // ko có lỗi
      res.status(200).json({ message: 'successfully' });
    } catch (error) {
      next(error);
    }
  }

}