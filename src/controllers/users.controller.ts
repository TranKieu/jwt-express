import { Request, Response, NextFunction } from 'express';
import { Controller } from './Controller';
import { HttpServer } from '../server/HttpServer';
import { Environment } from '../Environment';
import { validate, ValidationError } from 'class-validator';
import { userService, User, UserRole } from '../services/user.service';
import { authorization, checkRole } from '../middlewares/auth.middleware';
import { MethodNotAllowed } from '../errors/methodnotallowed.error';
import { NotFound } from '../errors/notfound.error';
import { BadRequest } from '../errors/badrequest.error';

export class UsersController implements Controller {

    private router = Environment.getVersion() + '/users';

    init(httpServer: HttpServer): void {
        /** Tất cả các Router add vào đây 
         *  + Funktion tương ứng của router 
         *    => call: this.nameFunk.bind(this) 
         *  - this trong bind là chính nó chứ ko phải là class này.
         **/

        // Read Alle Users
        httpServer.get(
            `${this.router}`, authorization.bind(this), this.getAll.bind(this)
        );
        // Read One = 
        httpServer.get(
            `${this.router}/:id([0-9]+)`, authorization.bind(this), this.getById.bind(this)
        );

        // Create new User
        httpServer.post(
            `${this.router}`, this.create.bind(this)
        );

        // Update One = id
        // call vì return của nó mới là RequestHandler
        httpServer.put(
            `${this.router}/:id([0-9]+)`,
            authorization.bind(this),
            checkRole.call(this, [UserRole.ADMIN]),
            this.update.bind(this)
        );

        // delete One = id
        httpServer.delete(
            `${this.router}/:id([0-9]+)`,
            authorization.bind(this),
            checkRole.call(this, [UserRole.ADMIN]),
            this.remove.bind(this)
        );
        // delete Alle Users
        httpServer.delete(
            `${this.router}`,
            this.removeAll.bind(this)
        );
    }

    /** Các bước thực hiện:
     *   + Kiểm tra dữ liệu đầu vào
     *   + lấy dữ liệu từ Service vs dữ liệu => trycatch
     *   + gửi về Client Data oder next(Exception)
     */
    private async getAll(
        req: Request, res: Response, next: NextFunction
    ): Promise<void> {

        // Sử dụng kiểu Promies
        await userService.getAll().then((data) => {
            res.json(data);
        }).catch(
            // hầu như ko có lỗi vs trường hợp này
            err => { next(err); }
        );
    }

    private async getById(
        req: Request, res: Response, next: NextFunction
    ): Promise<void> {
        try {
            const user = await userService.getById(+req.params.id);
            // gửi kết quả về
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    private async create(
        req: Request, res: Response, next: NextFunction
    ): Promise<void> {

        let { username, password, role } = req.body;
        const newUser = new User();
        newUser.username = username;
        newUser.password = password;
        newUser.role = role || 'ghost';

        // validate
        const validErrors = await validate(newUser);
        if (validErrors.length > 0) {
            let invalid = new BadRequest();
            invalid.message = validErrors.map(
                (error: ValidationError) => Object.values(error.constraints)
            ).join(', ');
            next(invalid);
            return;
        }

        // oki => hashpass
        newUser.hashPassword();

        try {
            // Return user được lưu vào DB
            await userService.create(newUser);
            res.status(200).json({ mesage: 'User saved Successfully' });
        } catch (error) {
            next(error);
        }
    }

    private async update(
        req: Request, res: Response, next: NextFunction
    ): Promise<void> {
        try {
            res.send(await userService.update({ ...req.body, userId: req.params.id }));
        } catch (err) {
            /** Lỗi khi:
             * + field updated ko thỏa mãn dk của Db zb: unique  
             * + ko tìm thấy entity cần update id = ko tồn tại
             */
            next(err);
        }
    }

    private async remove(
        req: Request, res: Response, next: NextFunction
    ): Promise<void> {
        try {
            // id luôn được validate bởi Parameter
            const delResult = await userService.delete(+req.params.id)
            if (delResult != 0) {
                res.status(200).json({ mesage: 'User successfully remove!' });
            } else {
                // User ko tồn tại
                next(new NotFound('User'));
            }
        } catch (error) {
            // Lỗi khi có vấn đề về relation của DB
            console.log('Lỗi => xử lý tùy từng lỗi trong service');
            next(error);
        }
    }

    private async removeAll(
        req: Request, res: Response, next: NextFunction
    ): Promise<void> {
        next(new MethodNotAllowed(req.method + ' : ' + req.url));
    }
}