import { Response, Request, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';
import { NotFound } from '../errors';

// production = ko đưa chi tiết lỗi về client
/** Các cách đưa lỗi ra tại Middlewares
 * + next(new Error()) + return;
 * + Throw chỉ dùng cho tryCatch
 */

export const errorHandler = async (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default Error
  const errorResonse = {
    success: false,
    name: 'Error',
    message: 'something wrong!',
    error: {}
  };

  if (err instanceof HttpError) {
    // Lấy các giá trị từ lỗi ra để gửi về
    errorResonse.name = err.name;
    errorResonse.message = err.message;
    res.status(err.status);
  } else {
    // Error chưa được khai báo
    res.status(404);
  }
  // Chỉ hiện ra khi developer
  errorResonse.error = err;
  // gửi về
  res.json(errorResonse);
};

// catch 404 and forward to error handler
export const cannotGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /** Routes được đọc từ trên xuống
   *  + Tới cái này thì Đưa lỗi ra
   *  + Next tới ErrorHandler để gửi về Client
   * */
  let url = req.method + req.url;
  next(new NotFound(url));
};
