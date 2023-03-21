import Parser from "rss-parser";
import { getNonEmptyStringOrNull } from "../utils/ensure-string-content";
import { Source, ColumnArticle } from "../types";

export function normalizeFeed(feed: any, feedUrl: Source): ColumnArticle[] {
  return feed.items.map((item) => {
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
      authorAvatar: feedUrl.logo,
      authorBrief: "",
    };
  });
}
