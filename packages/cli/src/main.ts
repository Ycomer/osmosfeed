#!/usr/bin/env node

import { performance } from "perf_hooks";
import { discoverSystemFiles } from "./lib/discover-files";
import { getConfig } from "./lib/get-config";
import { cliVersion } from "./utils/version";
import { putArticleListToS3 } from "./utils/s3";
import { checkTableExist } from "./lib/awsDynamodb";
import { TableName } from "./constant";
import { getAllColumnArticles } from "./lib/getArticleList";
import { getAllNews } from "./lib/getAllNews";
import { Article } from "./types";

require("dotenv").config();

async function run() {
  const startTime = performance.now();
  console.log(`[main] Starting build using cli version ${cliVersion}`);

  const systemFiles = await discoverSystemFiles();
  const config = await getConfig(systemFiles.configFile);
  // 校验下表是否都创建
  console.log(process.env.STATIC_HOST);
  await checkTableExist();
  /**
   * 1、获取所有的文章（通过爬虫）资讯（rss）
   * 2、对文章进行处理，修饰、过滤、去重 洗好以后直接上传到DynamoDB，之后再上传到S3
   */
  const enrichedArticleSource = async () => {
    const resultArray: any = [];
    for (const source of config.sources) {
      const ArticleLists = await getAllColumnArticles(source);
      resultArray.push(ArticleLists);
    }
    return resultArray;
  };

  const enrichedNewsSource = async () => {
    const resultArray: Article[] = [];
    for (const source of config.sources) {
      const ArticleLists = await getAllNews(source);
      resultArray.push(...ArticleLists);
    }
    return resultArray;
  };

  // const enrichedArticleLists = (await enrichedArticleSource());
  const enrichedNewsLists = await enrichedNewsSource();
  // await putArticleListToS3(enrichedArticleLists, TableName.ARTICLE);
  await putArticleListToS3(enrichedNewsLists, TableName.ARTICLE);

  const durationInSeconds = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`[main] Finished build in ${durationInSeconds} seconds`);
}

run();
