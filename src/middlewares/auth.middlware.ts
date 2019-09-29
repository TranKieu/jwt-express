import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { Environment } from '../environment';

import { User, UserRole } from '../entity/User';
import { getRepository } from 'typeorm';

import { Unauthorized } from '../errors/unauthorized.error';
import { Forbidden } from '../errors/forbidden.error';

export const authorization
    = async (req: Request, res: Response, next: NextFunction) => {
        // Lấy token từ Header
        const token = <string>req.header('x-auth');
        // const token = <string> req.headers['x-auth'] //cách 2
        let jwtPayload;

        try {
            // Kiểm tra xem token oki không
            jwtPayload = jwt.verify(token, Environment.getJWTSecret());
            // ko có lỗi 
            res.locals.jwtPayload = jwtPayload;
        } catch (error) {
            // unauthorized
            next(new Unauthorized());
            // xem có thoát khỏi router ko
            console.log('UNAUTH--ko dc');
        }

        // authorized => lấy dữ liệu từ token
        const { userId, username } = jwtPayload;

        // tạo token mới và gửi về Client => mỗi token chỉ tồn tại trong 1h
        const newToken = jwt.sign({ userId, username }, Environment.getJWTSecret(),
            {
                expiresIn: '1h'
            });

        // lưu vào Header để gửi xuống Client
        res.setHeader('x-auth', newToken);

        // gọi Middleware tiếp theo
        next();

    };

export const checkRole = (roles: Array<UserRole>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // get userId lưu trong jwtPayload#
        const userId = res.locals.jwtPayload.userId;

        let user: User;
        try {
            // id chuẩn vì lấy từ jwtPayload ra
            // thay bằng service
            user = await getRepository(User).findOneOrFail(userId);
        } catch (error) {
            // có lỗi = ko đăng nhập dc
            next(new Unauthorized());

        }

        // mọi thứ oki mới check Role
        if (roles.indexOf(user.role)) {
            next();
            // pass
        } else next(new Forbidden(req.url));
    };
};