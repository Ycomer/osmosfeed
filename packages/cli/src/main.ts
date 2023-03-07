#!/usr/bin/env node

import { performance } from "perf_hooks";
import { copyStatic } from "./lib/copy-static";
import { discoverSystemFiles, discoverUserFiles, getParsableFile } from "./lib/discover-files";
import { getCache } from "./lib/get-cache";
import { getConfig } from "./lib/get-config";
import { getCopyStaticPlan } from "./lib/get-copy-static-plan";
import { getSnippets } from "./lib/get-snippets";
import { compileTemplates } from "./lib/compile-templates";
import { setCache } from "./lib/set-cache";
import { writeFiles } from "./lib/write-files";
import { enrich, EnrichedSource } from "./lib/enrich";
import { getTemplateData } from "./lib/get-template-data";
import { renderAtom } from "./lib/render-atom";
import { renderUserSnippets } from "./lib/render-user-snippets";
import { cliVersion } from "./utils/version";
import { isNotNull } from "./utils/is-not-null";
import { putObject } from "./utils/cos";
import activeLists from "./utils/activities";

async function run() {
  const startTime = performance.now();
  console.log(`[main] Starting build using cli version ${cliVersion}`);

  const systemFiles = await discoverSystemFiles();
  const config = await getConfig(systemFiles.configFile);
  const userFiles = await discoverUserFiles();

  // 获取缓存的地方需要处理分片以后的数据并且进行汇总
  // 核心是只存一天的数据
  // 全部走线上，本地不存储, 上传的时候直接通过流的方式
  const cache = await getCache({ cacheUrl: config.cacheUrl, localCacheFile: systemFiles.localCacheFile });

  const enrichedSources: EnrichedSource[] = (
    await Promise.all(config.sources.map((source) => enrich({ source, cache, config })))
  ).filter(isNotNull);

  // 没必要生成html了。直接走json，客户端方便解析，和cache的文件一致
  const detailDataList = enrichedSources.flatMap((item) => item.articles);
  // 最后生成的atom文件
  const atom = renderAtom({ enrichedSources, config });
  // 将atom和json（像详情页数据）文件写到本地
  // atom目前用不到所以就还是使用之前的逻辑（后续可能改为只产生一个礼拜的）
  // const res = await writeFiles({ detail: detailDataList, atom });
  // 将atom和html文件上传到cos
  // cache的文件名是根据时间戳生成的, 客户端默认拉取最新日期的文件。同一天不管有多少内容都会直接覆盖对应的文件名
  // html的文件名是根据id生成，客户端根据对应的id拉取对应的文件直接渲染，覆盖规则同上
  // 上传的规则是每五分钟上传一次，和gitub action保持一致， 本地写脚本自动跑
  // 上传完成以后直接删掉本地的文件
  detailDataList.map(async (item) => {
    await putObject(item, `${item.id}.json`);
  });
  await putObject(atom, "feed.atom");
  // todo
  // 校验下缓存
  await putObject(activeLists, "activeLists.json");
  await setCache({ sources: enrichedSources, cliVersion });

  const durationInSeconds = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`[main] Finished build in ${durationInSeconds} seconds`);
}

run();
