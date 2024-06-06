import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getUsersTresure = async (req: any, res: any) => {
  const user = req.user;
  const tresures = await prisma.tresure.findMany({
    where: {
      users: {
        every: {
          id: user.id,
        },
      },
    },
  });
  return res.status(200).json(tresures);
};

const addTresureToUser = async (req: any, res: any) => {
  const { name } = req.body;
  const user = req.user;
  const { tresureId } = req.params;

  const t = await prisma.tresure.findFirst({});

  const tresure = await prisma.tresure.update({
    where: {
      id: tresureId,
    },
    data: {
      users: {
        connect: {
          id: user.id,
        },
      },
    },
  });
  if (tresure) {
    return res.status(200).json(tresure);
  } else {
    return res.status(404).json({ message: "Tresure not found" });
  }
};

const createTreasure = async (req: any, res: any) => {
  const { user } = req;
  if (user.roles.includes("ROLE_ADMIN")) {
    const { name, requiredLavel } = req.body;

    const treasure = await prisma.tresure.create({
      data: {
        name,
        required_level: requiredLavel,
      },
    });
    return res.status(200).json(treasure);
  }

  return res.status(401).json({ message: "Unauthorized" });
};

export { getUsersTresure, addTresureToUser, createTreasure };
