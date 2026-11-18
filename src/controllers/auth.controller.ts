import { Request, Response } from "express";
import { LoginDto, SignupDto } from "../dto/auth/auth.dto";
import { db } from "../config/db";
import { userTable } from "../db/user.schema";
import { eq } from "drizzle-orm";
import { AppError } from "../global/error";
import { HashingProvider } from "../global/hashing";
import { generateToken } from "../global/jwt/jwt";

export class AuthController {
  constructor(private readonly hashingProvider: HashingProvider) {}

  async signup(req: Request, res: Response) {
    try {
      // receive the signup request
      const signupRequest = req.body as SignupDto;

      const email = signupRequest.email.trim();
      const username = signupRequest.username.trim();

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
        .where(eq(userTable.username, username));

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
      console.error({ error });

      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalServerError({
        message: "something went wrong, try again later",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      // receive the login request
      const loginRequest = req.body as LoginDto;

      // check if the user exists
      const [existingUsername] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.username, loginRequest.username));

      if (!existingUsername) {
        throw AppError.notFound({
          message: "invalid credentials",
        });
      }

      // compare password
      const isPasswordCorrect = await this.hashingProvider.comparePasswords({
        password: loginRequest.password,
        hashedPassword: existingUsername.password,
      });

      if (!isPasswordCorrect) {
        throw AppError.badRequest({
          message: "invalid credentials",
        });
      }

      // give user access by generating access  token
      const { accessToken } = generateToken({
        userId: existingUsername.id,
        username: existingUsername.username
      });

      // return message
      return {
        message: "login successful",
        accessToken: accessToken
      };
    } catch (error) {
      console.error({ error });

      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalServerError({
        message: "something went wrong, try again later",
      });
    }
  }
}
