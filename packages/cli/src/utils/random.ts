import { randomBytes } from "crypto";
import { Md5 } from "ts-md5";
import dayjs from "dayjs";
// generate 8 length random string with crypto

function generateRandomId(length: number = 8) {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

function hashUniqueId(title: string) {
  return Md5.hashStr(title);
}

function getCurrentTime(time?: string) {
  return time ? dayjs(time).valueOf().toString() : dayjs().valueOf().toString();
}

export { generateRandomId, hashUniqueId, getCurrentTime };
