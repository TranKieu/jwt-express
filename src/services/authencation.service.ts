import { User } from '../entity/user';
import { getMongoRepository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { NotFound, Unauthorized } from '../errors';
import { environment } from '../environment';

export interface DataStoredInToken {
  userId: string;
  username: string;
  role: 'admin' | 'ghost';
}

class AuthencationService {
  public async login(username: string, password: string): Promise<string> {
    // kiểm tra trong DB
    let user: User;
    try {
      user = await getMongoRepository(User).findOneOrFail({
        username: username
      });
    } catch (error) {
      throw new Unauthorized(`Login failed: wrong Username: ${username}`);
    }

    if (!user.checkPasswordIsValidate(password)) {
      throw new Unauthorized(`Login failed: wrong Password!`);
    }
    // oki => tạo Token
    const payload: DataStoredInToken = {
      userId: user.userId,
      username: user.username,
      role: user.role
    };
    const token = jwt.sign(payload, environment.TOKEN_KEY, {
      expiresIn: environment.TOKEN_EXP
    });

    return token;
  }

  public async changPassword(
    userId: string,
    password: string,
    newpassword: string
  ): Promise<void> {
    let user: User;
    try {
      user = await getMongoRepository(User).findOneOrFail(userId);
    } catch (error) {
      throw new NotFound(`User ${userId}`);
    }
    // check oldpass macht
    if (!user.checkPasswordIsValidate(password)) {
      throw new Unauthorized('Password is not macht!');
    }

    user.password = newpassword;
    user.hashPassword();
    await getMongoRepository(User).save(user);
  }
}
export const authencationService = new AuthencationService();
