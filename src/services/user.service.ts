import { User } from '../entity/User';
export { User, UserRole } from '../entity/User';
import { getRepository } from "typeorm";
import { NotFound } from '../errors/notfound.error';
import { Duplication } from '../errors/duplicate.erors';
/**
 * import {getConnection} from "typeorm"; //calling typeORM
 * getConnection().getRepository(Users).find(); 
 *  */

class UserService {

    public async getAll(): Promise<User[]> {
        // const connection = await DatabaseProvider.getConnection();
        //return await connection.getRepository(Users).find();
        return await getRepository(User).find({
            select: ["userId", "username", "role"]
        });
    }

    public async getById(id: number): Promise<User> {
        // findOne({ field: "value" })
        try {
            return await getRepository(User)
                .findOneOrFail(id, {
                    select: ["userId", "username", "role"]
                });
        } catch (error) {
            throw new NotFound(`User : ${id}`);
        }
    }

    public async create(user: User): Promise<User> {
        try {
            // Return user được lưu vào DB
            return await getRepository(User).save(user);
        } catch (error) {
            // tùy từng database mà có code khác nhau
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Duplication(`This User ${user}`);
            } else {
                throw error;
            }
        }
    }

    public async update(user: User): Promise<User> {

        let updateUser: User;
        try {
            updateUser = await getRepository(User).findOneOrFail(user.userId);
        } catch (error) {
            throw new NotFound(`User ${user.userId}`);
        }

        /** let result = x || 10;
         *  result = 10 wenn x =
         *   +  0
         *   +  null
         *   +  undefined
         *   +  NaN
         *   +  "" (empty string)
         *   +  false  <= chú ý vs các trường boolean
         */
        // thực tế chỉ update role cho user => ko validate
        updateUser.role = user.role || updateUser.role;
        updateUser.username = user.username || updateUser.username;
        if (user.password && user.password.length > 5) {
            updateUser.password = user.password;
            updateUser.hashPassword();
        }

        try {
            // Trả về user được save
            return await getRepository(User).save(updateUser);

        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Duplication(`This User ${user}`);
            } else {
                throw error;
            }
        }
    }

    /** Delete: Có 2 cách
     * + xóa bằng delete(id) kết quả trả về 
     * 
     * 
     * + xóa bằng 
     */
    public async delete(id: number): Promise<number> {
        try {
            // khi delete luon chu y relation cua DB
            const delResult = await getRepository(User).delete(id);
            return delResult.affected; // trả về số rows bị xóa
        } catch (error) {
            // lỗi từ database
            throw error;
        }
    }
}

export const userService = new UserService();