import { RequestHandler } from 'express';

/** RequestHandler có dạng: = Middleware
 * 	export interface RequestHandler {
 * 	    (req: Request, res: Response): any;
 * 	    (req: Request, res: Response, next: NextFunction): any;
 * 	}
 */

export interface HttpServer {
  /* Các Methode quan trọng của Server */

  // Lấy data từ Database
  get(url: string, ...handler: RequestHandler[]): void;

  // Dưa data vào Database
  post(url: string, ...handler: RequestHandler[]): void;

  // Cập nhật Data lên Database
  put(url: string, ...handler: RequestHandler[]): void;

  // Xóa data từ Database
  delete(url: string, ...handler: RequestHandler[]): void;
  
  // Nếu cần thêm Methode thì khai báo vào đây
}
