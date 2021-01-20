import { Response, Request, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';
import { NotFound } from '../errors';

// production = ko đưa chi tiết lỗi về client
import { environment } from '../environment';

export const errorHandler = async (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof HttpError) {
    // Error chuẩn
    let errorResonse = {
      success: false,
      name: 'Error',
      message: 'something wrong!',
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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /** Các cách đưa lỗi ra tại Middlewares
   * + next(new Error())
   * + Throw ko dung dc no chi in ra loi tai log
   */

  /** Đưa lỗi trong Handler
   * ket thuc return,
   * thu next và throws xem sao
   *
   */
  let url = req.method + req.url;
  next(new NotFound(url));
};
