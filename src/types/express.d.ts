import { InferSelectModel } from "drizzle-orm";
import { userTable } from "../db/user.schema";

export type AuthenticatedUser = Omit<
  InferSelectModel<typeof userTable>,
  "password" | "updatedAt"
>;

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
