#!/usr/bin/env node

import { performance } from "perf_hooks";
import { discoverSystemFiles } from "./lib/discover-files";
import { getConfig } from "./lib/get-config";
import { cliVersion } from "./utils/version";
import { putArticleListToS3, putSpecialAticleListToS3, putSpecialTypeAticleListToS3 } from "./utils/s3";
import { checkTableExist, listTableImme } from "./lib/awsDynamodb";
import { TableName } from "./constant";
import { getAllColumnArticles } from "./lib/getArticleList";
import { getAllNews } from "./lib/getAllNews";
import { getAllTopicArticles } from "./lib/getAllTopicArticles";
import { Article } from "./types";

require("dotenv").config();

async function run() {
  const startTime = performance.now();
  console.log(`[main] Starting build using cli version ${cliVersion}`);

  const systemFiles = await discoverSystemFiles();
  const config = await getConfig(systemFiles.configFile);
  // 校验下表是否都创建, 没创建的话先进行创建
  await checkTableExist();
  const currentTables = await listTableImme();
  console.log(currentTables, "currentTables");
  if (currentTables?.length > 0) {
    /* 1、获取所有的文章（通过爬虫）资讯（rss）
     * 2、对文章进行处理，修饰、过滤、去重 洗好以后直接上传到DynamoDB，之后再上传到S3
     */
    const enrichedArticleSource = async () => {
      const resultArray: any = [];
      for (const source of config.sources) {
        const ArticleLists = await getAllColumnArticles(source);
        resultArray.push(...ArticleLists);
      }
      return resultArray;
    };

    const enrichedTopicSource = async () => {
      const resultArray: any = [];
      for (const source of config.sources) {
        const ArticleLists = await getAllTopicArticles(source);
        resultArray.push(...ArticleLists);
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

    // 专栏文章解析
    const enrichedArticleLists = await enrichedArticleSource();
    // 专题文章解析
    const entichTopicArticleLists = await enrichedTopicSource();
    // 资讯文章解析
    const enrichedNewsLists = await enrichedNewsSource();
    // 所有的文章合并之后上传S3 按照降序排列，最新的文章在最后面
    const finalArticleLists = [...enrichedArticleLists, ...enrichedNewsLists, ...entichTopicArticleLists].sort(
      (a, b) => {
        return Number(a.publishOn) - Number(b.publishOn);
      }
    );

    await putArticleListToS3(finalArticleLists, TableName.ARTICLE);
    await putSpecialAticleListToS3(entichTopicArticleLists, "topic");
    await putSpecialAticleListToS3(enrichedArticleLists, "column");
    // 专栏列表
    await putSpecialTypeAticleListToS3(enrichedArticleLists);
    // 专题列表
    await putSpecialTypeAticleListToS3(entichTopicArticleLists);
    const durationInSeconds = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`[main] Finished build in ${durationInSeconds} seconds`);
  }
}

run();
