import { normalizeFeed } from "./normalize-feed";
import { downloadTextFile } from "../utils/download";
import { Source, ColumnArticle } from "../types";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: ["media:thumbnail"],
  },
});

export async function getAllNews(source: Source): Promise<ColumnArticle[]> {
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
      return feed;
    } catch (error) {
      console.log(error, "XML parse error");
      throw error;
    }
  }
  return [];
}
