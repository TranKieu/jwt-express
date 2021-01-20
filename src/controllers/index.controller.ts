import { Controller } from './controller.interface';
import { HttpServer } from '../server/http-server';
import { Request, Response } from 'express';
import { log, logWithPar } from '../middlewares/log.middleware';

export class IndexController implements Controller {
  //private path = `${environment.API_URL}/path/`;
  private path = '';

  init(http: HttpServer) {
    // Với Middleware = RequestHandler
    http.get(
      this.path,
      log.bind(this),
      logWithPar.call(this, 'Parameter'),
      this.showIndex.bind(this)
    );

    http.get(`${this.path}/index`, this.get.bind(this));
  }

  private async showIndex(req: Request, res: Response): Promise<void> {
    // để test server bằng browser
    const inhalt = 'RUN';
    res.send(inhalt);
  }

  private async get(req: Request, res: Response): Promise<void> {
    // nếu muốn test template
    res.render('index', { title: 'Hallo' });
  }
}
