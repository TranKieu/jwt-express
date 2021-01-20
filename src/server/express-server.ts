import express, { Express, RequestHandler } from 'express';
import { Server } from 'http';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import morgan from 'morgan';

// From SRC
import { Controller } from '../controllers/controller.interface';
import { HttpServer } from './http-server';
import { environment } from '../environment';

// Middlewares
import {
  errorHandler,
  cannotGet
} from '../middlewares/errorhandler.middleware';
import { cors } from '../middlewares/cors.middleware';

import { noCache } from '../middlewares/nocache.middleware';

/**
 * helmet
 * compress
 */
export class ExpressServer implements HttpServer {
  private server!: Express;
  private httpServer!: Server;
  private development = environment.production === 'development';

  constructor(private controllers: Controller[]) {}

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
    this.addControllers(this.controllers);

    // Error Handler
    this.setupErrorHandler(this.server);

    // Tạo https oder socket nếu cần
    this.httpServer = this.listen(this.server, port);

    return this.httpServer;
  }

  public shutdownServer() {
    if (this.httpServer) this.httpServer.close();
  }

  private setupSercurityMiddlewares(server: Express) {
    /* Global-Middlewares */
    server.use(noCache);
    server.use(cors(environment.CORS_OPT));
    if (this.development) {
      server.use(morgan('dev'));
    }
  }

  private listen(server: Express, port: number): Server {
    const httpServer = http.createServer(server);
    console.info(`Starting server on port ${port}`);

    return httpServer.listen(port);
  }

  private setupStandardMiddlewares(server: Express) {
    server.use(
      bodyParser.urlencoded({
        extended: true
      })
    );

    server.use(bodyParser.json());
  }

  //private setupTemplate(server: Express)
  private setupTemplate(server: Express) { 
		server.set("views", "src/views");
		server.set("view engine", "ejs");
		server.use("/assets",
			express.static(path.join(__dirname, "../public")));
	}

  /** Gọi các Router ra */
  private addControllers(controllers: Controller[]) {
    // Chỉ dùng dc this khi sử dụng arrow Function
    // vì nó lấy this = Function ngoài nó chứ ko phải chính nó
    controllers.forEach((controller) => controller.init(this));
    /*  Nếu không dùng this
       this.controllers.forEach(function (controller) {
           controller.init(server);
       });
       */
  }

  /* ErrorHandler
   * => luôn sử dụng Middleware này cuối cùng, vì:
   * + Xử lý hết md khác trước
   * + nếu ko có router nào phù hợp thì mới tới cái này
   */
  private setupErrorHandler(server: Express) {
    // Cannot GET
    server.use(cannotGet);
    // Xử lý và đưa tất cả cách lỗi ra
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

  // log = In các Router được khai báo ra
  showRouter(method: String, url: string): void {
    if (this.development) console.log(`Added route: ${method} : ${url}`);
  }
}
