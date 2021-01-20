import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Length, IsEnum } from 'class-validator';

import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  GHOST = 'ghost'
}

@Entity()
export class User {
  @ObjectIdColumn()
  userId!: string;

  @Column({ unique: true })
  @Length(4, 20)
  username!: string;

  @Column()
  @Length(6, 100)
  password!: string;

  @CreateDateColumn()
  createdAt!: Date;

  // chỉ chạy với save
  @UpdateDateColumn()
  updatedAt?: Date;

  @Column()
  @IsEnum(UserRole)
  role!: UserRole;

  hashPassword() {
    if (this.password) this.password = bcrypt.hashSync(this.password, 10);
  }

  checkPasswordIsValidate(unencryptedPass: string) {
    return bcrypt.compareSync(unencryptedPass, this.password);
  }
}
