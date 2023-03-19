import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Article, News } from "../lib/enrich";

const client = new S3Client({
  region: "ap-northeast-1",
});

// 上传数据到S3
async function puDataToS3(content: any, keyname: string) {
  // 调用方法
  const stream = Buffer.from(JSON.stringify(content, undefined, 2));
  const params = {
    Bucket: "sophondev",
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

async function putArticleListToS3(list: Article[]) {
  list.forEach((item) => {
    const newPropertys = {
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
      lastUpdateTime: item.lastUdateTime,
      apppush: item.apppush,
    };
  });
}

async function putNewsListToS3(list: News[]) {
  list.forEach((item) => {
    const newPropertys = {
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
      updateTime: item.updateTime,
      apppush: item.apppush,
    };
  });
}

export { putArticleListToS3 };
