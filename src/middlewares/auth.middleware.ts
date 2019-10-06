import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { Environment } from '../environment';
import { User, UserRole } from '../entity/User';

import { Unauthorized } from '../errors/unauthorized.error';
import { AuthenticationToken } from '../errors/authentication.token.error';
import { Forbidden } from '../errors/forbidden.error';
import { authService, DataStoredInToken } from '../services/auth.service';

/**
 *  Với phiên bản Web thì có thể kêt hợp cookie lưu token
 * => có thể logout => xem lại sao token okikhac meo gi cookie
 */

export const authorization
    = async (req: Request, res: Response, next: NextFunction) => {
        const xTokenKey = Environment.getTokenHeaderKey();

        // Lấy token từ Header => để kiểm tra xem có tồn tại không
        const token = <string>req.header(xTokenKey);
        // const token = <string> req.headers['x-auth'] //cách 2
        if (token === undefined) {
            next(new AuthenticationToken('missing!'));
            return;
        }
        let jwtPayload: DataStoredInToken;

        try {
            // Kiểm tra xem token oki không
            jwtPayload =
                jwt.verify(token, Environment.getJWTSecret()) as DataStoredInToken;
            // ko có lỗi 
            res.locals.jwtPayload = jwtPayload;

        } catch (error) {
            // unauthorized
            next(new AuthenticationToken('is invalid!')); // để rõ
            return; // bắt buộc phải có return nếu đằng sau có code
        }

        // authorized => lấy dữ liệu từ token
        const { userId, username } = jwtPayload;

        /* Vì token ko có User vẫn tồn tại nên load luôn user nếu cần */


        // tạo token mới và gửi về Client => mỗi token chỉ tồn tại trong 1h
        const newToken = jwt.sign({ userId, username }, Environment.getJWTSecret(),
            {
                expiresIn: '1h'
            });

        // lưu vào Header để gửi xuống Client
        res.setHeader(xTokenKey, newToken);
        console.log('xong check auth');
        // gọi Middleware tiếp theo
        next();
    };

export const checkRole = (roles: Array<UserRole>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // get userId lưu trong jwtPayload
        console.log('Bat dau check Role');
        const userId = res.locals.jwtPayload.userId;

        let user: User;
        try {
            // id chuẩn vì lấy từ jwtPayload ra
            user = await authService.getById(userId);
        } catch (error) {
            next(new Unauthorized());
            return;
        }

        // mọi thứ oki mới check Role
        if (roles.indexOf(user.role) > -1) {
            next();
        } else
            next(new Forbidden(`${req.method} : ${req.url}`));
    };
};
/* Bearer -token
 let token = req.headers['x-access-token'] || req.headers['authorization'];
if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }
 */