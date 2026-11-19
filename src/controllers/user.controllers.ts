import { Request, Response } from "express";
import { userTable } from "../db/user.schema";
import { db } from "../config/db";
import { count, eq } from "drizzle-orm";
import { CreateUserDTO, UpdateUserDTO } from "../dto";
import { AppError } from "../global/error";
import { profile } from "node:console";
import { HashingProvider } from "../global/hashing";

export class UserController {
  constructor(private readonly hashingProvider: HashingProvider) {}

  async whoami(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        throw AppError.unauthorized({
          message: "unauthorized",
        });
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internalServerError({
        message: "something went wrong",
      });
    }
  }

  // async createUser(req: Request, res: Response) {
  //   try {
  //     const requestBody = req.body as CreateUserDTO;

  //     // collect and format the request body
  //     const userInsert: typeof userTable.$inferInsert = {
  //       firstName: requestBody.firstName,
  //       lastName: requestBody.lastName,
  //       username: requestBody.username,
  //       password: requestBody.password,
  //       email: requestBody.email,
  //     };

  //     // check if user already exists via email and username
  //     const existingEmail = await db
  //       .select()
  //       .from(userTable)
  //       .where(eq(userTable.email, requestBody.email));

  //     if (existingEmail.length > 0) {
  //       throw AppError.conflict({
  //         message: "email already exists",
  //       });
  //     }

  //     const existingUsername = await db
  //       .select()
  //       .from(userTable)
  //       .where(eq(userTable.username, requestBody.username));

  //     if (existingUsername.length > 0) {
  //       throw AppError.conflict({
  //         message: "username already exists",
  //       });
  //     }

  //     // save user
  //     const [savedUser] = await db
  //       .insert(userTable)
  //       .values(userInsert)
  //       .returning({
  //         id: userTable.id,
  //         firstName: userTable.firstName,
  //         lastName: userTable.lastName,
  //         username: userTable.username,
  //         email: userTable.email,
  //       });

  //     // return message
  //     return {
  //       message: "You have completed the sign up path",
  //       data: savedUser,
  //     };
  //   } catch (error) {
  //     if (error instanceof AppError) {
  //       throw error;
  //     }

  //     throw AppError.internalServerError({
  //       message: "something happened",
  //     });
  //   }
  // }

  // async getAllUser(req: Request, res: Response) {
  //   const users = await db.select().from(userTable);
  //   const total = await db.select({ count: count() }).from(userTable);

  //   return {
  //     message: "Response successful",
  //     data: users,
  //     total: total[0].count,
  //   };
  // }

  // async getSingleUser(req: Request, res: Response) {
  //   const { email } = req.params;

  //   const [user] = await db
  //     .select()
  //     .from(userTable)
  //     .where(eq(userTable.email, email.toString().toLowerCase()));

  //   if (user) {
  //     throw AppError.notFound({
  //       message: "user not found",
  //       details: `cant find user by this email: ${email.toString().toLowerCase()}`,
  //     });
  //   }

  //   return {
  //     message: `user with email:${email} has been retrieved`,
  //     data: user,
  //   };
  // }

  async updateSingleProfile(req: Request, res: Response) {
    const user = req.user;
    const updateBody = req.body as UpdateUserDTO;

    if (!user) {
      throw AppError.unauthorized({
        message: "unauthorized",
      });
    }

    // check if user already exists via email and username
    if (updateBody.email) {
      if (updateBody.email === user.email) {
        throw AppError.badRequest({
          message: "new email cannot be the same as old",
        });
      }

      const [existingEmail] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, updateBody.email));

      if (existingEmail) {
        throw AppError.conflict({
          message: "email already exists",
        });
      }
    }

    if (updateBody.username) {
      const [existingUsername] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.username, updateBody.username));

      if (existingUsername) {
        throw AppError.conflict({
          message: "username already exists",
        });
      }
    }

    const updatedUser = await db
      .update(userTable)
      .set({
        firstName: updateBody.firstName,
        lastName: updateBody.lastName,
        username: updateBody.username,
        email: updateBody.email,
      })
      .where(eq(userTable.id, user.id.toString()))
      .returning({
        id: userTable.id,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
        username: userTable.username,
        email: userTable.email,
      });

    return {
      message: "User Updated Successfully",
      data: updatedUser,
    };
  }

  // async deleteSingleUser(req: Request, res:Response) {
  //   const { firstName } = req.params

  //   await db.delete(userTable).where(eq(userTable.firstName, firstName.toString()))

  //   return{
  //     message: "The user has been deleted"
  //   }
  // }

  async deleteProfile(req: Request, res: Response) {
    // get password from param
    const { password } = req.params;

    // get user from request via auth middleware
    const user = req.user;

    // check user exists
    if (!user) {
      throw AppError.notFound({
        message: "Profile not found",
      });
    }

    // fetch user password
    const [userPassword] = await db
      .select({
        password: userTable.password,
      })
      .from(userTable)
      .where(eq(userTable.id, user.id));

      // compare passed password against hashed user password
    const isPasswordCorrect = this.hashingProvider.comparePasswords({
      password: password.toString(),
      hashedPassword: userPassword.password,
    });

    // check if password is correct
    if(!isPasswordCorrect) {
      throw AppError.unauthorized({
        message: "invalid credentials"
      })
    }

    // delete user
    await db.delete(userTable).where(eq(userTable.id, user.id))

    
    return {
      message: "Profile deleted"
    };
  }
}
