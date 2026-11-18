import { config } from "dotenv";
import { z } from "zod";

config();

const schema = z.object ({
    PORT: z.coerce.number().default(7000),
    DATABASE_URL: z.string(),
    NODE_ENV: z.string().default("development"),
    JWT_SECRET: z.string().min(16),
    JWT_TOKEN_ISSUER: z.string(),
    JWT_ACCESS_TOKEN_TIME_TO_LIVE: z.string(),
    JWT_TOKEN_AUDIENCE: z.string(),
})

export const env = schema.parse(process.env); 