#!/usr/bin/env node

import { performance } from "perf_hooks";
import { discoverSystemFiles } from "./lib/discover-files";
import { getConfig } from "./lib/get-config";
import { enrich, EnrichSchema, EnrichSchemaArticle, enrichArticleItem } from "./lib/enrich";
import { cliVersion } from "./utils/version";
import { isNotNull } from "./utils/is-not-null";
import { putArticleListToS3, putNewsListToS3 } from "./utils/s3";
import { checkTableExist, putDatasToDB } from "./lib/awsDynamodb";
import { TableName } from "./constant";
require("dotenv").config();

async function run() {
  const startTime = performance.now();
  console.log(`[main] Starting build using cli version ${cliVersion}`);

  const systemFiles = await discoverSystemFiles();
  const config = await getConfig(systemFiles.configFile);

  // const enrichedArticleSource: EnrichSchemaArticle[] = await Promise.all(
  //   config.sources.map((source) => enrichArticleItem({ source, config }))
  // );

  const enrichedSources: EnrichSchema[] = (
    await Promise.all(config.sources.map((source) => enrich({ source, config })))
  ).filter(isNotNull);

  // 所有的资讯的列表
  await checkTableExist();
  const detailDataList = enrichedSources.flatMap((item) => item.articles);
  // 获取所有的文章（通过爬虫）

  // 上传到DynamoDB
  await putDatasToDB(detailDataList, TableName.NEWS);

  // 上传到S3
  // await putNewsListToS3(detailDataList, "NEWS");

  const durationInSeconds = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`[main] Finished build in ${durationInSeconds} seconds`);
}

run();
