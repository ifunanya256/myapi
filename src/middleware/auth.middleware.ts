import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../global/error";
import { env } from "../config/env";
import { JwtPayload } from "../global/jwt/jwt";
import { db } from "../config/db";
import { userTable } from "../db/user.schema";
import { eq } from "drizzle-orm";

export const authenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("applying authentication middleware");

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // [Bearer, token]
  }

  if (!token) {
    return next(
      AppError.unauthorized({
        message: "not authorized... no token was provided",
      }),
    );
  }

  try {
    // verifying token and extracting user id
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: env.JWT_TOKEN_ISSUER,
      audience: env.JWT_TOKEN_AUDIENCE,
    }) as JwtPayload;

    const userId = decoded.id;
    // const username = decoded.username;

    const [user] = await db
      .select({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        username: userTable.username,
        email: userTable.email,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .where(eq(userTable.id, userId));

    if (!user) {
      return next(
        AppError.unauthorized({
          message: "invalid access token passed",
        }),
      );
    }

    req.user = user;
    next()
  } catch (error: any) {
    if (error instanceof AppError) {
      return next(error);
    }

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(
        AppError.unauthorized({
          message: "invalid or expired token",
        }),
      );
    }

    return next(
      AppError.internalServerError({
        message: error.message,
      }),
    );
  }
};
