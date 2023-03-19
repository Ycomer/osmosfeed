import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Article, News } from "../lib/enrich";
import { querySpecificTableData } from "../lib/awsDynamodb";
import { updateFlagStatus } from "./dataBaseOperation";
const Bucket = "sophondev";
const client = new S3Client({
  region: "ap-northeast-1",
});

// 上传数据到S3
async function puDataToS3(content: any, keyname: string) {
  // 调用方法
  const stream = Buffer.from(JSON.stringify(content, undefined, 2));
  const params = {
    Bucket: Bucket,
    Key: keyname,
    Body: stream,
  };
  const command = new PutObjectCommand(params);
  try {
    const data = await client.send(command);
    console.log(data);
  } catch (error) {
    console.log(error);
  } finally {
    console.log("what error");
  }
}
// 获取桶下面的指定前缀的文件
async function getMaxOrderFromS3(name: string) {
  const params = {
    Bucket: Bucket,
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

async function putArticleListToS3(list: Article[]) {
  const maxOrder = (await getMaxOrderFromS3("article")) | 0;
  const finalArticleList: any = [];
  for (const item of list) {
    try {
      // 查询flag字段的值
      const currentFlag = await querySpecificTableData("ARTICLE", item.publishOn);
      if (currentFlag === 1) {
        const newPropertysList = {
          id: item.id,
          title: item.title,
          imgUrl: item.imgUrl,
          authorId: item.authorid,
          authorName: item.authorName,
          authorAvatar: item.authorAvatar,
          publishOn: item.publishOn,
          bannerTime: item.bannerTime,
          topTime: item.topTime,
          hotTime: item.hotTime,
          type: item.type,
          snippet: item.snippet,
          wordCount: item.wordCount,
          tags: item.tags,
          cid: item.cid,
          tid: item.tid,
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
        await puDataToS3(newPropertysDetial, `article_${item.id}.json')`);
        // 文章当前最大自增json
        finalArticleList.push(newPropertysList);
      } else {
        console.log("flag字段的值为0或者2，不上传");
      }
    } catch (error) {
      console.log(error, "上传出错了");
    }
  }
  // 文章列表
  const finalOrder = maxOrder + 1;
  await puDataToS3(finalArticleList, `article_${finalOrder}.json`);
  await putCurrentMaxOrderToS3(finalOrder, "article");
}

export async function putNewsListToS3(list: News[], name: "string") {
  const maxOrder = (await getMaxOrderFromS3(name.toLowerCase())) | 0;
  const resultArray: any = [];
  for (const item of list) {
    try {
      // 查询flag字段的值
      const currentFlag = await querySpecificTableData(name.toUpperCase(), item.publishOn);
      console.log(currentFlag, "currentFlag");
      if (currentFlag === 1) {
        const newPropertysList = {
          id: item.id,
          title: item.title,
          imgUrl: item.imgUrl,
          authorId: item.authorid,
          authorName: item.authorName,
          authorAvatar: item.authorAvatar,
          publishOn: item.publishOn,
          topTime: item.topTime,
          snippet: item.snippet,
          tags: item.tags,
          updateTime: item.updateTime,
          apppush: item.apppush,
        };
        const newPropertysDetial = {
          ...newPropertysList,
          content: item.rawContent,
        };
        //资讯详情
        await puDataToS3(newPropertysDetial, `${name.toLowerCase()}_${item.id}.json`);
        resultArray.push(newPropertysList);
      } else {
        console.log("flag字段的值为0或者2，不上传");
        resultArray.push(null);
      }
    } catch (error) {
      console.log(error, "上传出错了");
      resultArray.push(null);
    }
  }
  await puDataToS3WithError(resultArray, maxOrder, name);
}

function sliceArray(list: any) {
  const chunkSize = 20;
  const subArrays = [];
  for (let i = 0; i < list.length; i += chunkSize) {
    subArrays.push(list.slice(i, i + chunkSize));
  }
  return subArrays;
}

async function puDataToS3WithError(list: any, maxOrder: number, tablename: string) {
  let finalNewsList = list.filter((item: any) => item !== null);
  let finalOrder = maxOrder + 1;
  // 分组分成小的数组 每组20个，够20个 数组名称加1
  const listNews = sliceArray(finalNewsList);
  for (const item of listNews) {
    try {
      await puDataToS3(item, `${tablename.toLowerCase()}_${finalOrder++}.json`);
      await putCurrentMaxOrderToS3(finalOrder, tablename.toLowerCase());
    } catch (error) {
      // 失败了以后讲flag字段的值改为2
      await updateFlagStatus(tablename, item[0].publishOn, item.id, 2);
    }
  }
}

async function putCurrentMaxOrderToS3(maxOrder: number, tablename: string) {
  const Order = {
    name: maxOrder,
  };
  puDataToS3(Order, `${tablename}_max_rder.json`);
}

export { putArticleListToS3 };
