import { normalizeFeed } from "./normalize-feed";
import { downloadTextFile } from "../utils/download";
import { Source, ColumnArticle, Article } from "../types";
import { enrichSingleArticle } from "../lib/enrich";
import { putDataToUserDB, putDatasToDB, queryArticlePublish } from "../lib/awsDynamodb";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: ["media:thumbnail"],
  },
});

export async function getAllNews(source: Source): Promise<Article[]> {
  if (source.type === 0) {
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
      const feed = normalizeFeed(rawFeed, source);
      const newsArticle = await checkAndUploadNews(feed, source);
      return newsArticle;
    } catch (error) {
      console.log(error, "XML parse error");
      throw error;
    }
  }
  return [];
}

export async function checkAndUploadNews(list: ColumnArticle[], source: Source) {
  let finalAtcile: Article[] = [];
  for (const item of list) {
    try {
      const richArtcle = await enrichSingleArticle(item, source);
      console.log(richArtcle, "richArtcle");
      const { Count, Items } = await queryArticlePublish("ARTICLE", richArtcle.enrichedArticle.hashId);
      const currentItems = Items as any;
      if (currentItems.length > 0) {
        // 有数据
        const currentArticlePusblishon = currentItems[0]?.publishon.S;
        if (+richArtcle.enrichedArticle.publishOn < currentArticlePusblishon) {
          break;
        } else {
          await putDatasToDB(richArtcle.enrichedArticle, "ARTICLE");
          await putDataToUserDB(richArtcle.enrichUser, "USER");
        }
      } else {
        await putDatasToDB(richArtcle.enrichedArticle, "ARTICLE");
        await putDataToUserDB(richArtcle.enrichUser, "USER");
      }
      finalAtcile.push(richArtcle.enrichedArticle);
    } catch (error) {
      console.log(error, "error");
      throw new Error("Failed to enrich article");
    }
  }
  return finalAtcile;
}
