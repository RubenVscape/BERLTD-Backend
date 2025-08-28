import 'reflect-metadata';
import { createExpressServer, RoutingControllersOptions } from 'routing-controllers';
import { connectDB } from './config/db';
import { authorizationChecker, currentUserChecker } from './auth/authorizationChecker';
require("dotenv").config();

connectDB();
const controllersPath = `${__dirname}/controller/*.{js,ts}`;
const localHtmlPath = `${__dirname}/public/index.html`

console.log(controllersPath);
const routingControllersOptions: RoutingControllersOptions = {
  routePrefix: "/api",
  controllers: [controllersPath],
  validation: true,
  classTransformer: true,
  cors: true,
  defaultErrorHandler: false,
  authorizationChecker,
  currentUserChecker
};


const app = createExpressServer(routingControllersOptions);

const PORT = process.env.PORT || 3001;

app.get("/", (req:any, res:any) => {
  res.sendFile(localHtmlPath);
});

app.use((error:any, req:any, res:any, next:any) => {
  if(error.httpCode) {
    return res.status(error.httpCode).json({
      name:error.name,
      message: error.message,
    })
  }
  return res.status(500).json({
    name:'InternalServerError',
    message: error.message || 'Unexpected Error'
  })
})
app.listen(PORT, () => {
  console.log(`[Server] running at http://localhost:${PORT}`);
});


export default app;


