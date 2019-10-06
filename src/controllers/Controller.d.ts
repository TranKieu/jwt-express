import { HttpServer } from '../server/HttpServer';

export interface Controller {
    init(HttpServer: HttpServer): void;
}