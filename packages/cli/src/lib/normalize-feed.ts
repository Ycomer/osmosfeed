import Parser from "rss-parser";
import { getNonEmptyStringOrNull } from "../utils/ensure-string-content";
import { Source, ColumnArticle } from "../types";
import { uploadImageAndGetPath } from "../utils/getimage";

export async function normalizeFeed(feed: any, feedUrl: Source): Promise<ColumnArticle[]> {
  const feedsArray = await Promise.all(
    feed.items.map(async (item) => {
      // 更细粒度的获取新闻的图片
      const thumbnailImage = getNonEmptyStringOrNull(item["media:thumbnail"]);
      const imgUrl = thumbnailImage;
      return {
        url: getNonEmptyStringOrNull(item.link),
        content: getNonEmptyStringOrNull(item.content),
        descp: getNonEmptyStringOrNull(item.contentSnippet),
        publishon: getNonEmptyStringOrNull(item.isoDate),
        summary: getNonEmptyStringOrNull(item.summary),
        title: getNonEmptyStringOrNull(item.title),
        imgUrl,
        lang: feedUrl.lang,
        authorName: feedUrl.title,
        authorAvatar: await uploadImageAndGetPath(feedUrl.logo),
        authorBrief: "",
      };
    })
  );
  return feedsArray;
}
