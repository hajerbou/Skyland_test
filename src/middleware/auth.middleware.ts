//verify jwt and authorize user, and get user data from database

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Express } from "express";
const prisma = new PrismaClient();

export const verifyToken = async (req: any, res: any, next: NextFunction) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findFirst({
    where: {
      email: (decoded as any).email,
    },
  });

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!user.is_verified) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = user;

  next();
};
