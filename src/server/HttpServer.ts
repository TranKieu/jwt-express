import { RequestHandler } from 'express';

/** RequestHandler có dạng:
 * 	export interface RequestHandler {
 * 	    (req: Request, res: Response): any;
 * 	    (req: Request, res: Response, next: NextFunction): any;
 * 	}
 */

export interface HttpServer {

    get(url: string, ...handler: RequestHandler[]): void;

    post(url: string, ...handler: RequestHandler[]): void;

    put(url: string, ...handler: RequestHandler[]): void;

    delete(url: string, ...handler: RequestHandler[]): void;
    // Nếu cần thêm Methode thì khai báo vào đây
}