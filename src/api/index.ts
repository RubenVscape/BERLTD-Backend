import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '..'; // your Express app export

export default (req: VercelRequest, res: VercelResponse) => {
  app(req, res); // let Express handle it
};