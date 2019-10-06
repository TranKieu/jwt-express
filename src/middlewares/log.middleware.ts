import { Response, Request, NextFunction } from 'express';

export const log = async (
    req: Request, res: Response, next: NextFunction
) => {
    // test local middlerware 
    console.log('LOG: ', req.url);
    next();
}

export const logWithPar = (arg: string) => {
    return async (
        req: Request, res: Response, next: NextFunction
    ) => {
        // test loacal middlerware mit Parameter
        console.log(`LogWithPar= ${arg}: ${req.url}`);
        next();
    }
}