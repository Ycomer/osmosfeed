import { randomBytes } from "crypto";
// generate 8 length random string with crypto

function generateRandomId(length: number = 8) {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

export { generateRandomId };
