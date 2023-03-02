import path from "path";
import { PUBLIC_ROOT_DIR } from "./path-constants";
import type { Cache } from "./get-cache";
import { mkdirAsync, writeFileAsync } from "../utils/fs";
import type { EnrichedArticle } from "./enrich";

const CACHE_FILENAME = "cache.json";

export async function setCache(data: Cache) {
  // 去重复数据
  const fuckasd = removeDuplicateContent(data);
  console.log(fuckasd, "what receive");
  const cacheString = JSON.stringify(data, undefined, 2);
  console.log(`[cache] Post-build cache generated by cli ${data.cliVersion}`);

  await mkdirAsync(path.resolve(PUBLIC_ROOT_DIR), { recursive: true });

  const cacheOutputPath = path.resolve(PUBLIC_ROOT_DIR, CACHE_FILENAME);
  await writeFileAsync(cacheOutputPath, cacheString);
  console.log(`[cache] Post-build cache written: ${cacheOutputPath}`);
}

// 递归去除多层数组中的重复数据，其中最里面的数组是个对象数组
function removeDuplicateContent(data: Cache) {
  const { sources } = data;
  const result = sources.map((source) => {
    const { articles } = source;
    const obj: any = {};
    const result = articles.reduce((cur, next) => {
      obj[next.id] ? "" : (obj[next.id] = true && cur.push(next));
      return cur;
    }, []); // 转换成对象键值对的形式
    return {
      ...source,
      articles: result,
    };
  });
  return {
    ...data,
    sources: result,
  };
}
