import app from "../index";
import { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel expects a function with (req, res)
export default (req: VercelRequest, res: VercelResponse) => {
  app(req, res);
};
