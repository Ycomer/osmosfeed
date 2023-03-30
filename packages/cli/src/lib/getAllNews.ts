import { normalizeFeed } from "./normalize-feed";
import { downloadTextFile } from "../utils/download";
import { Source, ColumnArticle, Article } from "../types";
import { enrichSingleArticle } from "../lib/enrich";
import { putDataToUserDB, putDatasToDB, queryArticlePublish, queryUserIdStatus } from "../lib/awsDynamodb";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: ["media:thumbnail"],
  },
});

export async function getAllNews(source: Source): Promise<Article[]> {
  if (source.type !== 0) return [];
  try {
    const xmlString = await downloadTextFile(source.href).catch((err) => {
      console.error(`[enrich] Error downloading source ${source.href}`);
      return "";
    });

    const rawFeed = await parser.parseString(xmlString)!.catch((err) => {
      console.error(`[enrich] Parse source failed ${source.href}`);
      throw err;
    });
    // const rawFeed = parser.parse(xmlString);
    const feed = await normalizeFeed(rawFeed, source);
    const newsArticle = await checkAndUploadNews(feed, source);
    return newsArticle;
  } catch (error) {
    console.log(error, "XML parse error");
    throw error;
  }
}

export async function checkAndUploadNews(list: ColumnArticle[], source: Source) {
  let finalAtcile: Article[] = [];
  for (const item of list) {
    try {
      const richArtcle = await enrichSingleArticle(item, source);
      console.log(richArtcle, "richArtcle");
      // 查询文章是否已经写入
      const resArticle = await queryArticlePublish("ARTICLE", richArtcle.enrichedArticle.hashId);
      // 查询作者是否已经写入
      const resUser = await queryUserIdStatus("USER", richArtcle.enrichUser.uid);
      if (resArticle?.length === 0) {
        // 表里没有这个hash文章，直接插入
        await putDatasToDB(richArtcle.enrichedArticle, "ARTICLE");
        finalAtcile.push(richArtcle.enrichedArticle);
      }
      if (resUser?.length === 0) {
        await putDataToUserDB(richArtcle.enrichUser, "USER");
      }
    } catch (error) {
      console.log(error, "error");
      throw new Error("Failed to enrich article");
    }
  }
  return finalAtcile;
}
