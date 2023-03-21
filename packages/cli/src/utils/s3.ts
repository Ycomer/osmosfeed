import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Article } from "../types";
import { querySpecificTableData } from "../lib/awsDynamodb";
import { updateFlagStatus } from "./dataBaseOperation";
import { PageInfo } from "../constant";

const client = new S3Client({
  region: process.env.STATIC_REGION,
});

// 上传数据到S3
export async function puDataToS3(content: any, keyname: string) {
  const stream = Buffer.from(JSON.stringify(content, undefined, 2));
  const params = {
    Bucket: process.env.STATIC_BUCKET,
    Key: keyname,
    Body: stream,
  };
  const command = new PutObjectCommand(params);
  try {
    const data = await client.send(command);
    return data;
  } catch (error) {
    console.log(error);
  } finally {
    console.log("上传到S3成功");
  }
}

// 获取桶下面的指定前缀的文件
async function getMaxOrderFromS3(name: string) {
  const params = {
    Bucket: process.env.STATIC_BUCKET,
    Key: `${name}_max_rder.json`,
  };
  try {
    const response = await client.send(new GetObjectCommand(params));
    const jsonString = await response.Body?.transformToString("utf-8");
    const data = JSON.parse(jsonString as string);
    return data.name;
  } catch (error) {
    console.log(error);
  }
}

async function putArticleListToS3(list: Article[], tableName: string) {
  const maxOrder = (await getMaxOrderFromS3(tableName.toLowerCase())) | 1;
  const resultArray: any = [];
  for (const item of list) {
    try {
      // 查询flag字段的值
      const currentFlag = await querySpecificTableData(tableName, item.hashId);
      if (currentFlag === 1) {
        const newPropertysList = {
          title: item.title,
          imgUrl: item.imgUrl,
          publishOn: item.publishOn,
          bannerTime: item.bannerTime,
          topTime: item.topTime,
          hotTime: item.hotTime,
          type: item.type,
          snippet: item.snippet,
          wordCount: item.wordCount,
          tags: item.tags,
          cid: item.cid,
          tTitle: item.tTitle,
          tSubTitle: item.tSubTitle,
          lastUpdateTime: item.lastUpdateTime,
          apppush: item.apppush,
        };
        const newPropertysDetial = {
          ...newPropertysList,
          content: item.rawContent,
        };
        // 文章详情
        await puDataToS3(newPropertysDetial, `${tableName.toLowerCase()}_${item.aid}.json`);
        // 文章当前最大自增json
        resultArray.push(newPropertysDetial);
      } else {
        console.log("flag字段的值为0或者2，不上传");
        resultArray.push(null);
      }
    } catch (error) {
      console.log(error, "上传出错了");
      resultArray.push(null);
    }
  }
  // 文章列表
  await puDataToS3WithError(resultArray, maxOrder, tableName);
}

function sliceArray(list: any) {
  if (list.length === 0) return [];
  const subArrays = [];
  for (let i = 0; i < list.length; i += PageInfo.chunkSize) {
    subArrays.push(list.slice(i, i + PageInfo.chunkSize));
  }
  return subArrays;
}

async function puDataToS3WithError(list: any, maxOrder: number, tablename: string) {
  // 根据当前最大的order值，计算出已经上传的数据的大小， 讲剩余的数据进行分页上传即可
  const uploadedSize = PageInfo.chunkSize * maxOrder;
  let finalNewsList = list.filter((item: any) => item !== null);
  let finalOrder = maxOrder;
  finalNewsList = finalNewsList.slice(uploadedSize);
  const listNews = sliceArray(finalNewsList);
  // 如果返回的数据产生的页数和拿到当前最大的页面一致， 只需要把最后一页的数据填满
  if (listNews.length > 0) {
    for (const item of listNews) {
      try {
        await puDataToS3(item, `${tablename.toLowerCase()}_${finalOrder++}.json`);
        await putCurrentMaxOrderToS3(finalOrder, tablename);
      } catch (error) {
        // 失败了以后讲flag字段的值改为2
        await updateFlagStatus(tablename, item[0].publishOn, item.id, 2);
      }
    }
  }
}

async function putCurrentMaxOrderToS3(maxOrder: number, tablename: string) {
  const Order = {
    name: maxOrder,
  };
  puDataToS3(Order, `${tablename.toLowerCase()}_max_rder.json`);
}

export { putArticleListToS3 };
