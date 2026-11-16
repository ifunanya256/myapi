import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { env } from "./config/env";
import { connectDb } from "./config/db";
import { logger, responseInterceptor } from "./middleware";
import router from "./routes";
dotenv.config()
// import { connectDb } from "./config/db";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(logger)
app.use(responseInterceptor)

app.use("/api/v1", router)

async function start() {
  await connectDb()

  app.listen(env.PORT, () => {
    console.log(`server is running on http://localhost:${env.PORT}/api/v1`)
  })
}

start().catch((err) => {
  console.error('failed to start', err)
  process.exit(1)
})
