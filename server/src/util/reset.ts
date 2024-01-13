import { db } from "db/dbClient";

const main = async () => {
  await db.clearData();
  console.log("db cleared");
};

main();
