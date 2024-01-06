import { randomBytes } from "crypto";

export const generateGameSessionId = () => {
  return randomBytes(3).toString("hex").toUpperCase();
};

export const generateRandomId = () => {
  return randomBytes(12).toString("base64");
};
