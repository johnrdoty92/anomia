import { PrismaClient } from "@prisma/client";
import { seedDefaultDeck } from "./defaultDeck";

const dbClient = new PrismaClient();

const main = async () => {
  await seedDefaultDeck(dbClient);
};

main()
  .then(async () => await dbClient.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await dbClient.$disconnect();
    process.exit(1);
  });
