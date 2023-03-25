// 获取图片地址并上传到s3，返回s3的相对路径
import axios from "axios";
import { putImagesToS3 } from "./s3";
import { isBase64 } from "../utils/tools";
import { randomWithImageName } from "../utils/random";
import fs from "fs";
import { promisify } from "util";
import fetch from "node-fetch";

const uploadImageAndGetPath = async (imgUrl: string): Promise<string> => {
  const imageName = randomWithImageName();
  try {
    const { imgData, contentType } = await downloadImage(imgUrl);
    const imgPath = `static/${imageName}.png`;
    await putImagesToS3(imgData, imgPath, contentType);
    return imgPath;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
// 下载网络图片
async function downloadImage(url: string): Promise<Buffer> {
  const fuckRespone = await fetch(url);
  const finalData = await fuckRespone.arrayBuffer();
  const contentType = fuckRespone.headers.get("content-type");
  if (!contentType?.includes("image")) {
    throw new Error("Invalid content type");
  }
  return { imgData: finalData, contentType };
}

// 图片压缩
// const optimizeImg = async (data: any) => {
//   const imgMeta = await imagemin.buffer(data, {
//     plugins: [imageminJpegtran({}), imageminPngquant({ quality: [0.2, 0.1] }), imageminSvgo(), imageminWebp()],
//   });
//   return imgMeta;
// };

const uploadImageAndGetPathFromList = async (imgList: string[]) => {
  const imgPathList: any = [];
  for (const imgUrl of imgList) {
    const imgPath = await uploadImageAndGetPath(imgUrl);
    imgPathList.push(imgPath);
  }
  return imgPathList;
};

export { uploadImageAndGetPath, uploadImageAndGetPathFromList };
