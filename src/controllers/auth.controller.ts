import { Request, Response } from "express";
import { SignupDto } from "../dto/auth/auth.dto";
import { db } from "../config/db";
import { userTable } from "../db/user.schema";
import { eq } from "drizzle-orm";
import { AppError } from "../global/error";
import { HashingProvider } from "../global/hashing";

export class AuthController {
  constructor(private readonly hashingProvider: HashingProvider) {}

  async signup(req: Request, res: Response) {
    try {
      // receive the signup request
      const signupRequest = req.body as SignupDto;

      const email = signupRequest.email.trim().toLowerCase();
      const username = signupRequest.username.trim().toLowerCase();

      // check if the email already exists
      const [existingUserEmail] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email));

      if (existingUserEmail) {
        throw AppError.notFound({
          message: "user found",
          details: `user already exists with this email: ${email}`,
        });
      }

      const [existingUsername] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email));

      if (existingUsername) {
        throw AppError.notFound({
          message: "username found",
          details: `username already exists... select another one`,
        });
      }

      // hash the user password
      const hashedPassword = await this.hashingProvider.hashPassword({
        password: signupRequest.password,
      });

      // save the user
      const userInsert: typeof userTable.$inferInsert = {
        password: hashedPassword,
        email: email,
        username: username,
      };

      const [savedUser] = await db
        .insert(userTable)
        .values(userInsert)
        .returning();

      // return message
      return {
        message: "user sign up completed",
        data: savedUser,
      };
    } catch (error) {

      console.error({error})

      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalServerError({
        message: "something went wrong, try again later",
      });
    }
  }
}
