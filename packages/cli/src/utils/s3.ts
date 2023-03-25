import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Article } from "../types";
import { querySpecificTableData } from "../lib/awsDynamodb";
import { updateFlagStatus } from "./dataBaseOperation";
import { PageInfo } from "../constant";
import { lookup } from "mime-types";
const client = new S3Client({
  region: process.env.STATIC_REGION,
});

// 上传数据到S3
export async function puDataToS3(content: any, keyname: string) {
  const stream = Buffer.from(JSON.stringify(content, undefined, 2));
  const getfileExtension = keyname.split(".")[1];
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${process.env.STATIC_BUCKET}/*`],
      },
    ],
  };
  const params = {
    Bucket: process.env.STATIC_BUCKET,
    Key: keyname,
    Body: stream,
    ContentType: lookup(getfileExtension) || "application/json",
    ACL: "public-read",
    Policy: JSON.stringify(policy),
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
    console.log(error, "获取最大页数失败");
  }
}
// 获取当前最大页数内容
export async function getMaxPageFromS3(name: string, page: number) {
  const params = {
    Bucket: process.env.STATIC_BUCKET,
    Key: `${name}_${page}.json`,
  };
  try {
    const response = await client.send(new GetObjectCommand(params));
    const jsonString = await response.Body?.transformToString("utf-8");
    const data = JSON.parse(jsonString as string);
    return data;
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
          id: item.aid,
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
          authorName: item.authorName,
          authorAvatar: item.authorAvatar,
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
  let mutipleList = [];
  const pageSize = PageInfo.chunkSize;
  let finalOrder = maxOrder;
  const startIdx = pageSize * (maxOrder - 1);
  let dataInCurrentPage: any[] = startIdx === 0 ? [] : await getMaxPageFromS3(tablename.toLowerCase(), finalOrder - 1);
  mutipleList = [...dataInCurrentPage, ...list];
  const listNews = sliceArray(mutipleList);
  for (const item of listNews) {
    try {
      await puDataToS3(item, `${tablename.toLowerCase()}_${++finalOrder}.json`);
      await putCurrentMaxOrderToS3(finalOrder, tablename);
    } catch (error) {
      // If an error occurs, set the 'flag' field to 2.
      await updateFlagStatus(tablename, item.publishOn, item.id, 2);
    }
  }
}

async function putCurrentMaxOrderToS3(maxOrder: number, tablename: string) {
  const Order = {
    name: maxOrder,
  };
  puDataToS3(Order, `${tablename.toLowerCase()}_max_rder.json`);
}

async function putCurrentMaxOrderToS3WithoutUpper(maxOrder: number, name: string) {
  const Order = {
    name: maxOrder,
  };
  puDataToS3(Order, `${name}_max_rder.json`);
}

// 上传专栏/专题的列表
// 直接获取每一个作者最新的文章一篇， 返回这个列表即可，可分页
// 专栏/专题的详情列表，直接获取每一个作者的所有文章，返回这个列表即可，可分页
/**
 * @param list 专栏/专题的列表
 * @param tableName 专栏/专题的表名
 * @param type 专栏/专题
 * */
export async function putSpecialAticleListToS3(list: Article[], type: string) {
  try {
    const maxOrder = (await getMaxOrderFromS3(type)) | 1;
    const allCids = Array.from(new Set(list.map((item) => item.cid)));
    const newestArticles = allCids.map((cid) => {
      const articlesInCid = list.filter((item) => item.cid === cid);
      const newestArticle = articlesInCid.reduce(
        (currentNewest, article) => (article.publishOn > currentNewest.publishOn ? article : currentNewest),
        articlesInCid[0] // 将初始值设置为cid下的第一篇文章
      );
      return newestArticle;
    });
    newestArticles.sort((a, b) => b.publishOn.localeCompare(a.publishOn));
    //文章列表
    await puDataToS3WithError(newestArticles, maxOrder, type);
    //专栏/专题的详情列表，直接获取每一个作者的所有文章，返回这个列表即可，可分页
  } catch (error) {
    console.log(error, "上传出错了");
  }
}

// 上传专栏/专题的详情列表
// 专栏/专题的详情列表，直接获取每一个作者的所有文章，返回这个列表即可，可分页
/**
 * @param list 专栏/专题的列表
 * @param tableName 专栏/专题的表名
 * @param type 专栏/专题
 * */

export async function putSpecialTypeAticleListToS3(list: Article[]) {
  // 获取所有的cid
  const allCids = Array.from(new Set(list.map((item) => item.cid)));

  // 遍历所有的cid，并将对应的所有文章存入一个新的数组中
  const articlesByCid = allCids.map((cid) => {
    const articlesInCid = list
      .filter((item) => item.cid === cid)
      .sort((a, b) => b.publishOn.localeCompare(a.publishOn));
    return { id: cid, articles: articlesInCid };
  });

  for (const item of articlesByCid) {
    //文章列表
    await specialAticleListWithError(item);
  }
}

async function specialAticleListWithError(list: any) {
  const maxOrder = (await getMaxOrderFromS3(list.id)) | 1;
  // 根据当前最大的order值，计算出已经上传的数据的大小， 讲剩余的数据进行分页上传即可
  let mutipleList = [];
  const pageSize = PageInfo.chunkSize;
  let finalOrder = maxOrder;
  const startIdx = pageSize * (maxOrder - 1);
  let dataInCurrentPage: any[] = startIdx === 0 ? [] : await getMaxPageFromS3(list.id, finalOrder - 1);
  mutipleList = [...dataInCurrentPage, ...list.articles];
  const listNews = sliceArray(mutipleList);
  for (const item of listNews) {
    try {
      await puDataToS3(item, `${item.cid}_${++finalOrder}.json`);
      await putCurrentMaxOrderToS3WithoutUpper(finalOrder, item.cid);
    } catch (error) {
      console.log(error, "上传s3失败");
    }
  }
}

export { putArticleListToS3 };
