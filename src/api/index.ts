import app from "../index";
import serverless from "@vendia/serverless-express";

// Vercel needs a function handler, not just an express app
export default serverless({ app });

