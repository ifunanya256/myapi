import jwt from "jsonwebtoken";
import { Response } from "express";
import { env } from "../../config/env";

export type JwtPayload = {
  id: string;
  username: string
};

export interface TokenResponse {
  accessToken: string;
  // refreshToken: string
}

export const generateToken = ({
  userId,
  username
}: {
  userId: string;
  username: string
}): TokenResponse => {
  const payload = {
    id: userId,
    username: username
  } as JwtPayload;

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: Number(env.JWT_ACCESS_TOKEN_TIME_TO_LIVE),
    issuer: env.JWT_TOKEN_ISSUER,
    audience: env.JWT_TOKEN_AUDIENCE,
  });

  return {
    accessToken: accessToken,
  };
};
