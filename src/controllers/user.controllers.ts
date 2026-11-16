import { Request, Response } from "express";
import { userTable } from "../db/user.schema";
import { db } from "../config/db";
import { count, eq } from "drizzle-orm";
import { request } from "node:http";
import { CreateUserDTO } from "../dto";
import { AppError } from "../global/error";

export class UserController {
  async createUser(req: Request, res: Response) {
    const requestBody = req.body as CreateUserDTO;

    // collect and format the request body
    const userInsert: typeof userTable.$inferInsert = {
      firstName: requestBody.firstName,
      lastName: requestBody.lastName,
      username: requestBody.username,
      password: requestBody.password,
      email: requestBody.email,
    };

    // check if user already exists via email and username
    const existingEmail = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, requestBody.email));

    if (existingEmail.length > 0) {
      throw AppError.conflict({
        message: "email already exists",
      });
    }

    const existingUsername = await db
      .select()
      .from(userTable)
      .where(eq(userTable.username, requestBody.username));

    if (existingUsername.length > 0) {
      throw AppError.conflict({
        message: "username already exists",
      });
    }

    // save user
    const [savedUser] = await db
      .insert(userTable)
      .values(userInsert)
      .returning({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        username: userTable.username,
        email: userTable.email,
      });

    // return message
    return {
      message: "You have completed the sign up path",
      data: savedUser,
    };
  }

 async getAllUser(req: Request, res: Response) {
    const users = await db.select().from(userTable);
    const total = await db.select({ count: count() }).from(userTable);
 
    return {
      message: "Response successful",
      data: users,
      total: total[0].count
    }
  }

  async getSingleUser(req: Request, res: Response) {
    const { email } = req.params

    const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email.toString()))

    return{
      message: `user with email:${email} has been retrieved`,
      data: user,
    }
  }
}
