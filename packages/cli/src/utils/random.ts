import { randomBytes } from "crypto";
import { Md5 } from "ts-md5";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

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

function getIdWithType(type: number) {
  // 默认是专栏
  let prefix = {
    typeId: 0,
    customId: "c",
  };
  if (type === 2) {
    prefix.customId = `c_${uuidv4()}`;
  } else if (type === 3) {
    prefix.customId = `t${uuidv4()}`;
    prefix.typeId = 1;
  }
  return prefix;
}

function randomWithImageName() {
  return `${dayjs().format("YYYYMMDDHHmmss")}_${generateRandomId(4)}}`;
}

export { generateRandomId, hashUniqueId, getCurrentTime, getIdWithType, randomWithImageName };
