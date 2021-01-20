import { Request, Response, NextFunction } from 'express';

export interface CorsOptions {
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  methods?: string;
  origin?: string;
  credentials?: boolean;
}

export const cors = (argOpt?: CorsOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const optDefault: CorsOptions = {
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'X-Access-Token',
        'Authorization'
      ],
      exposedHeaders: ['Content-Length', 'Authorization'],
      methods: 'GET, HEAD, OPTIONS, PUT, PATCH, POST, DELETE',
      origin: '*',
      credentials: true
    };

    const option: CorsOptions = { ...optDefault, ...argOpt };

    // Request origin: Allow ALL
    res.header('Access-Control-Allow-Origin', option.origin);

    // Allowed Headers gửi đến Server
    res.header(
      'Access-Control-Allow-Headers',
      option.allowedHeaders?.join(',')
    );

    // Allowd Headers gửi về Client <= Angular mới đọc được
    res.header(
      'Access-Control-Expose-Headers',
      option.exposedHeaders?.join(',')
    );

    // Allowed methods
    res.header('Access-Control-Allow-Methods', option.methods);

    res.header(
      'Access-Control-Allow-Credentials',
      (option.credentials as unknown) as string
    );

    // Chấp nhận các Header gửi lên
    if ('OPTIONS' === req.method) {
      res.sendStatus(200);
    } else {
      next();
    }
  };
};
