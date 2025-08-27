import express from 'express';
import app from './main';


const server = express();

server.use(app);


export default app;