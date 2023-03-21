import { randomBytes, createHash } from "crypto";
import { Md5 } from "ts-md5";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

// generate 8 length random string with crypto

function generateRandomId(length: number = 8) {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

// 根据种子生成8位唯一位id
function seedHashId(title: string) {
  return createHash("sha256").update(title).digest("hex").slice(0, 8);
}

function hashUniqueId(title: string) {
  return Md5.hashStr(title);
}

function getCurrentTime(time?: string) {
  return time ? dayjs(time).valueOf().toString() : dayjs().valueOf().toString();
}

function getIdWithType(type: number) {
  // c专栏 t专题 n资讯
  // 2专栏 3专题 0资讯
  let prefix = {
    typeId: 0,
    customId: "c",
  };
  if (type === 2) {
    prefix.customId = `c_${uuidv4()}`;
  } else if (type === 3) {
    prefix.customId = `t${uuidv4()}`;
    prefix.typeId = 1;
  } else if (type === 0) {
    prefix.customId = `n_${uuidv4()}`;
  }
  return prefix;
}

function randomWithImageName() {
  return `${dayjs().format("YYYYMMDDHHmmss")}_${generateRandomId(4)}}`;
}

function getUUID() {
  return uuidv4();
}

export { generateRandomId, hashUniqueId, getCurrentTime, getIdWithType, randomWithImageName, getUUID, seedHashId };
