import { ObjectID } from 'mongodb';
import { getMongoRepository } from 'typeorm';
import { User } from '../entity/user';

import { NotFound, ResourceExist } from '../errors';

class UserService {
  public async getById(id: string): Promise<User> {
    try {
      return await getMongoRepository(User).findOneOrFail(id, {
        select: ['userId', 'username', 'role']
      });
    } catch (error) {
      throw new NotFound(`User ${id}`);
    }
  }

  public async getAll(): Promise<User[]> {
    try {
      return await getMongoRepository(User).find({
        select: ['userId', 'username', 'role']
      });
    } catch (error) {
      throw error;
    }
  }

  public async create(user: User): Promise<User> {
    // insert Resource
    try {
      return await getMongoRepository(User).save(user);
    } catch (error) {
      // tùy từng database mà có code khác nhau
      // MySQL: ER_DUP_ENTRY
      if (error.code === 11000) {
        throw new ResourceExist(`User ${user.username}`);
      } else {
        throw error;
      }
    }
  }

  public async update(id: string, user: User): Promise<boolean> {
    try {
      // UpdateResult
      const result = await getMongoRepository(User).findOneAndUpdate(
        { _id: new ObjectID(id) },
        { $set: { ...user, updatedAt: new Date() } }
      );

      return result.value ? true : false;
    } catch (error) {
      if (error.code === 11000) {
        throw new ResourceExist(`User ${user.username}`);
      } else {
        console.log(error);
        throw error;
      }
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const del = await getMongoRepository(User).findOneAndDelete({
        _id: new ObjectID(id)
      });
      return del.value ? true : false;
    } catch (error) {
      throw error;
    }
  }
}
export const userService = new UserService();
