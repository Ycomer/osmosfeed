#!/usr/bin/env node

import { performance } from "perf_hooks";
import { discoverSystemFiles } from "./lib/discover-files";
import { getConfig } from "./lib/get-config";
import { enrichNews, enrichArticle, News } from "./lib/enrich";
import { cliVersion } from "./utils/version";
import { putArticleListToS3, putNewsListToS3 } from "./utils/s3";
import { checkTableExist, putDatasToDB } from "./lib/awsDynamodb";
import { TableName } from "./constant";

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
   * 1、获取所有的文章（通过爬虫）
   * 2、对文章进行处理，修饰、过滤、去重
   * 3、将文章上传到DynamoDB
   * 4、将文章上传到S3 （列表和详情JSON）
   */

  console.log(config.sources, "what source");
  const enrichedArticleSource = await Promise.all(
    config.sources.map((source) => source.type && enrichArticle({ source, config }))
  );

  /**
   *
   * 1.对RSS拉到的新闻进行处理，修饰、过滤、去重
   * 2.将新闻列表上传到DynamoDB
   * 3.将新闻上传到S3（列表和详情JSON）
   */
  // const enrichedNewsSources = await Promise.all(
  //   config.sources.map((source) => !source.type && enrichNews({ source, config }))
  // );

  // 需要找出哪些是新数据，哪些是旧数据，旧数据不需要上传到S3
  // 上传到DynamoDB
  // await putDatasToDB(enrichedNewsSources, TableName.NEWS);
  // 上传到S3
  // await putNewsListToS3(enrichedNewsSources, TableName.NEWS);

  const durationInSeconds = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`[main] Finished build in ${durationInSeconds} seconds`);
}

run();
