import { Request, Response } from "express";
import { userTable } from "../db/user.schema";
import { db } from "../config/db";
import { count, eq } from "drizzle-orm";
import { request } from "node:http";
import { CreateUserDTO, UpdateUserDTO } from "../dto";
import { AppError } from "../global/error";
import { id } from "zod/v4/locales";
import { toLowerCase } from "zod";

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
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
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalServerError({
        message: "something happened",
      });
    }
  }

  async getAllUser(req: Request, res: Response) {
    const users = await db.select().from(userTable);
    const total = await db.select({ count: count() }).from(userTable);

    return {
      message: "Response successful",
      data: users,
      total: total[0].count,
    };
  }

  async getSingleUser(req: Request, res: Response) {
    const { email } = req.params;

    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email.toString().toLowerCase()));

    if (user) {
      throw AppError.notFound({
        message: "user not found",
        details: `cant find user by this email: ${email.toString().toLowerCase()}`,
      });
    }

    return {
      message: `user with email:${email} has been retrieved`,
      data: user,
    };
  }

  async updateSingleUser (req: Request, res: Response) {
    const { id } = req.params

    const updateBody = req.body as UpdateUserDTO

    const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, id.toString()))

    if (!user) {
      throw AppError.badRequest({
        message: "User not found",
        details: "check the id passed.... call the getAllUser endpoint user",
      })
    }

    const updatedUser = await db
    .update(userTable)
    .set({
      firstName: updateBody.firstName,
      lastName: updateBody.lastName,
      username: updateBody.username,
      password: updateBody.password,
      email: updateBody.email,
    })
    .where(eq(userTable.id, id.toString()))
    .returning

    return{
      message: "User Updated Successfully",
      data: updatedUser,
    }
  }

  async deleteSingleUser(req: Request, res:Response) {
    const { firstName } = req.params

    await db.delete(userTable).where(eq(userTable.firstName, firstName.toString()))

    return{
      message: "The user has been deleted"
    }
  }
}


