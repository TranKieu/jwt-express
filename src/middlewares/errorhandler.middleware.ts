import { Response, Request, NextFunction } from 'express';
import { HttpError } from '../errors/HttpError';
import { NotFound } from '../errors/notfound.error';

// production = ko đưa chi tiết lỗi về client
import { Environment } from "../environment";

export const errorHandler = async (
  err: HttpError, req: Request, res: Response, next: NextFunction
) => {

  if (err instanceof HttpError) {
    // Error chuẩn
    let errorResonse = {
      success: false,
      name: "Error",
      message: "something wrong!",
      error: {}
    };

    // Dua gia tri vao Response
    errorResonse.name = err.name;
    errorResonse.message = err.message; // cai nay se hien cho client
    // err phai mo ta tot hon ve chi hien khi develop
    errorResonse.error = err;

    // Gui ve
    res.status(err.status);
    res.json(errorResonse);
  } else {
    // Error chưa được khai báo
    res.status(404).json(err);
  }
};

// catch 404 and forward to error handler
export const cannotGet = async (
  req: Request, res: Response, next: NextFunction
) => {
  /** Các cách đưa lỗi ra tại Middlewares
   * + Throw = chỉ dùng trong service  
   * + next(new Error()) = tại controller sau catch Errors từ service
   */
  next(new NotFound(req.method + ' : ' + req.url));
};
