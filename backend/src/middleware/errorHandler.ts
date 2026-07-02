import { Request, Response, NextFunction } from 'express'

export interface CustomError extends Error {
  status?: number
}

export function errorHandler(err: CustomError, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err)

  const status = err.status || 500
  const message = err.message || 'Internal Server Error'

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
  })
}
