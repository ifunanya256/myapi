import { email, z } from "zod";

// Username: 3–20 characters, letters, numbers, underscores, and dots (no leading/trailing/consecutive dots or underscores)
const usernameRegex = /^(?=[a-zA-Z0-9._]{3,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

// Password: At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const createUserDto = z.object({
  firstName: z
    .string()
    .min(1, "First name must be included")
    .max(100, "First name must not exceed 100 characters"),

  lastName: z
    .string()
    .min(1, "Last name must be included")
    .max(100, "Last name must not exceed 100 characters"),

  username: z
    .string()
    .toLowerCase()
    .regex(
      usernameRegex,
      "Username can only contain letters, numbers, dots, and underscores, and cannot start or end with a dot or underscore",
    )
    .min(3, "Username must have at least 3 characters")
    .max(30, "Username must not exceed 30 characters"),

  password: z
    .string()
    .regex(
      passwordRegex,
      "Password must include uppercase, lowercase, a number, and a special character (@$!%*?&)",
    )
    .min(10, "Password must not be less than 10 characters")
    .max(20, "Password must not exceed 20 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(emailRegex, "Please enter a valid email address"),
});

export type CreateUserDTO = z.infer<typeof createUserDto>;
