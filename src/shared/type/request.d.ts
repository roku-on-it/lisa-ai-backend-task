import { Request } from 'express';

export interface RequestWithState extends Request {
  session: {
    userId: string;
  };
}
