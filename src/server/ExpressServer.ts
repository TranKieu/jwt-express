import express from 'express';
import { Express, RequestHandler } from 'express';
import { Server } from 'http';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import * as path from 'path';

// From SRC
import { Controller } from '../controllers/Controller';
import { HttpServer } from './HttpServer';
import { Environment } from '../environment';

// Middlewares
import { errorHandler, cannotGet }
    from '../middlewares/errorhandler.middleware';
import { noCache } from '../middlewares/nocache.middleware';
import { checkRole, authorization }
    from '../middlewares/auth.middleware';
/**
 * helmet
 * compress
 * cros
 */
export class ExpressServer implements HttpServer {

    private server: Express;
    private httpServer?: Server;
    private development = Environment.getENV() === 'development';

    constructor(private controllers: Controller[]) { }

    /**
     *  Vì có async nên type trả về là Promise
     *  => khi gọi thì thêm await ở trc sẽ trả về Server
     */
    public async setup(port: number): Promise<Server> {

        this.server = express();
        /**
         * Luôn phải tính toán vị trị đặt Middleware và Router 
         *   => Nếu ko sẽ ko hoạt động như mong muốn
         *      Vì Middleware và Router hoạt động từ trên xuống dưới
         */
        // Đưa middleware cơ bản vào
        this.setupStandardMiddlewares(this.server);
        // add các Sercurity Middleware vào => phải đúng thứ tự
        this.setupSercurityMiddlewares(this.server);
        // Đưa template vào nếu cần Font-end 
        this.setupTemplate(this.server);



        //addcontrollers
        this.addControllers();

        // Error Handler
        this.setupErrorHandler(this.server);

        // thêm bước gán vào http để có thể tạo https oder socket
        this.httpServer = this.listen(this.server, port);

        return this.httpServer;
    }


    private setupSercurityMiddlewares(server: Express) {
         server.use(noCache);
    }

    private listen(server: Express, port: number): Server {
        const httpServer = http.createServer(server);
        console.info(`Starting server on port ${port}`)

        return httpServer.listen(port)
    }

    private setupStandardMiddlewares(server: Express) {

        server.use(bodyParser.urlencoded({
            extended: true
        }));

        server.use(bodyParser.json());

    }

    private setupTemplate(server: Express) {

        server.set('views', 'src/views');
        server.set('view engine', 'ejs');
        // nếu có template thì cần static ordner
        server.use('/assets',
            express.static(path.join(__dirname, '../public')));
    }

    private addControllers() {
        // Chỉ dùng dc this khi sử dụng arrow Function
        // vì nó lấy this = Function ngoài nó chứ ko phải chính nó
        this.controllers.forEach(controller =>
            controller.init(this));
        /* 
       this.controllers.forEach(function (controller) {
           controller.init(server);
       });
       */
    }

    private setupErrorHandler(server: Express) {

        // Cannot GET
        server.use(cannotGet);
        // Xu Ly va dua ra tat ca cac loi
        server.use(errorHandler);
    }

    get(url: string, ...handler: RequestHandler[]): void {

        this.showRouter('GET', url);
        // handler tự động lấy req và res của Connection
        this.server.get(url, handler);
    }

    post(url: string, ...handler: RequestHandler[]): void {

        this.showRouter('POST', url);
        this.server.post(url, handler);
    }

    put(url: string, ...handler: RequestHandler[]): void {

        this.showRouter('PUT', url);
        this.server.put(url, handler);
    }

    delete(url: string, ...handler: RequestHandler[]): void {

        this.showRouter('DELETE', url);
        this.server.delete(url, handler);
    }

    //log
    showRouter(method: String, url: string): void {
        if (this.development)
            console.log(`Added route: ${method} : ${url}`);
    }
}
