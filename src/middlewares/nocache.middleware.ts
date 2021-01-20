import { Request, Response, NextFunction } from 'express';

export const noCache = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // xóa X-Powered-By: Express
  res.removeHeader('X-Powered-By');
  res.setHeader('Expires', '0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
};
