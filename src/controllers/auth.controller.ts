import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import nodemailer from "nodemailer";
import { Express } from "express";

const prisma = new PrismaClient();
const login = async (req: any, res: any) => {
  try {
    const { emailOrUsername, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          {
            username: emailOrUsername,
          },
        ],
      },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.is_verified) {
      return res.status(401).json({
        message:
          "Please check you inbox or spam folder for the verification email",
      });
    }
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstname,
        lastName: user.lastname,
        roles: user.roles,
      },
      process.env.JWT_SECRET!
    );
    res.status(200).json({ token });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "An error occured while logging in" });
  }
};

const signup = async (req: any, res: any) => {
  try {
    const { email, username, password, firstname, lastname } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET!);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstname,
        lastname,
        password: hashedPassword,
        verification_token: verificationToken,
      },
    });
    const transporter = nodemailer.createTransport({
      service: process.env.NODEMAILER_SERVICE,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Email Verification",
      text: `Please verify your email by clicking on the following link: ${process.env.SERVER_URL}:${process.env.PORT}/auth/verify/${verificationToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Email sent: " + info.response);
    });

    res.status(201).json({ message: "Your account was created please verify" });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "An error occured while signing up" });
  }
};
const verify = async (req: any, res: any) => {
  const { token } = req.params;

  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  const user = await prisma.user.update({
    where: {
      email: (decoded as JwtPayload).email as string,
    },
    data: {
      is_verified: true,
    },
  });
  res.send("Email verified successfully");
};
export { login, signup, verify };
