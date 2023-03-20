// 获取图片地址并上传到s3，返回s3的相对路径
import axios from "axios";
import { puDataToS3 } from "./s3";
import { isBase64 } from "../utils/tools";
import { randomWithImageName } from "../utils/random";

const uploadImageAndGetPath = async (imgUrl: string): Promise<string> => {
  const imageName = randomWithImageName();
  try {
    if (isBase64(imgUrl)) {
      const imageKeyName = `${imageName}.png`;
      return uploadImageDataToS3(imgUrl, imageKeyName);
    } else {
      const imgPath = `static/${imageName}`;
      const { data } = await axios.get(imgUrl, { responseType: "arraybuffer" });
      await puDataToS3(data, imgPath);
      return imgPath;
    }
  } catch (error) {
    console.error(error);
    console.log(error, "获取图片地址失败");
    throw error;
  }
};

// 上传图片
const uploadImageDataToS3 = async (data: ArrayBuffer | string, keyName: string): Promise<string> => {
  try {
    await puDataToS3(data, `static/${keyName}`);
    return `static/${keyName}`;
  } catch (error) {
    console.error(error);
    console.log(error, "上传图片失败");
    throw error;
  }
};

// 获取图片名称
const getUrlName = (url: string) => {
  return (url.includes("?") ? url.split("?")[0] : url).split("/").pop();
};

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
    console.log(imgPath, "处理好的imgPath");
    imgPathList.push(imgPath);
  }
  return imgPathList;
};

export { uploadImageAndGetPath, uploadImageAndGetPathFromList };
