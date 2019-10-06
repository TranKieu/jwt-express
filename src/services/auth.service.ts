import { getRepository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { User } from '../entity/User';
export { User } from '../entity/User';
import * as jwt from 'jsonwebtoken';
import { Environment } from '../environment';

import { InvalidAuthentication } from '../errors/invalid.authentication.error';
import { NotFound } from '../errors/notfound.error';
import { BadRequest } from '../errors/badrequest.error';

// muốn lưu dữ liệu gì trong Token thì cho vào đây
export interface DataStoredInToken {
    userId: number;
    username: string;
}

class AuthService {
    /**
     * + Validate đầu vào tại Controller
     * + Validate Entity tại Service
     * + Xử lý Error tại Controller vs next
     * + Throw Error tại Service => chú ý loại lỗi
     */

    public async getById(id: number): Promise<User> {
        return await getRepository(User).findOneOrFail(id);
    }


    public async login(
        username: string, password: string
    ): Promise<{ token: string, jwtPayload: DataStoredInToken }> {

        let user: User;
        try {
            user = await getRepository(User).findOneOrFail({ where: { username } });
        } catch (error) {
            let credential = `username: ${username}`;
            throw new InvalidAuthentication(credential);
        }

        if (!user.checkPasswordIsValidate(password)) {
            let credential = `password: ${password}`;
            throw new InvalidAuthentication(credential);
        }

        // oki => tạo token gửi lại cho Client
        let jwtPayload: DataStoredInToken = { userId: user.userId, username: username };
        let token: string = jwt.sign(
            jwtPayload,
            Environment.getJWTSecret(),
            { expiresIn: '1h' }
        );
        return { token, jwtPayload };
    }

    // user = {userId, newPassword}
    public async changePassword(
        userId: number, oldPassword: string, newPassword: string
    ): Promise<User> {
        let user: User;
        try {
            user = await getRepository(User).findOneOrFail(userId);
        } catch (error) {
            throw new NotFound('User');
        }
        // check oldpass matchs
        if (!user.checkPasswordIsValidate(oldPassword)) {
            throw new InvalidAuthentication();
        }

        // validate password length
        user.password = newPassword;
        const validErrors = await validate(user);
        if (validErrors.length > 0) {
            let invalid = new BadRequest();
            invalid.message = validErrors.map(
                (error: ValidationError) => Object.values(error.constraints)
            ).join(', ');
            throw invalid;
        }

        user.hashPassword();
        return await getRepository(User).save(user);
    }

}
export const authService = new AuthService();