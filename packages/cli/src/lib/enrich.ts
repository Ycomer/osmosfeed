import cheerio from "cheerio";
import Parser from "rss-parser";
import { downloadTextFile } from "../utils/download";
import { getFirstNonNullItem } from "../utils/get-first-non-null-item";
import { removeHtmlEmptyTags } from "../utils/html-to-text";
import { hashUniqueId, getCurrentTime } from "../utils/random";
import { isTopPin } from "../utils/top";
import { isHotArticle } from "../utils/hot";
import { getTagsByTitle } from "../utils/tags";
import { isBannerPin } from "../utils/isBanner";
import type { Config, Source } from "./get-config";
import { normalizeFeed, ParsedFeedItem } from "./normalize-feed";
export interface EnrichSchema {
  articles: News[];
}
export interface EnrichSchemaArticle {
  articles: Article[];
}
// 这个地方是入库的字段，出库的时候不一定要全部出库，可以根据需要出库
export interface Article {
  /**
   * 是否通过app推送 0未推送 1推送
   */
  apppush: number;
  /**
   * 文章作者id
   */
  authorid: String;
  /**
   * 文章作者标题
   */
  authorName: String;
  /**
   * 文章作者标题
   */
  authorAvatar: String;
  /**
   * 是否存在顶部swiper 0 不存在 1存在
   */
  bannerTime: number;
  /**
   * 热门文章 0 不是 1是
   */
  hotTime: number;
  /**
   * 文章唯一id
   */
  id: string;
  /**
   * 文章图
   */
  imgUrl: string;
  /**
   * 发布时间
   */
  publishOn: string;
  /**
   * 文章内容
   */
  rawContent: string;
  /**
   * 副标题文章介绍
   */
  snippet: string;
  /**
   * 是否审核通过 0 未通过 1通过
   */
  status: number;
  /**
   * 文章标签
   */
  tags: string[];
  /**
   * 文章标题
   */
  title: string;
  /**
   * 置顶文章 0不置顶 1置顶
   */
  topTime: number;
  /**
   * 文章类型 0 全部 1 深度文章 2 专栏 3 专题 前面都是包含关系
   */
  type: number;
  /**
   * 文章字数
   */
  wordCount: number;
  /**
   * 专栏id
   */
  cid: string;
  /**
   * 专题id
   */
  tid: string;
  /**
   * 专题标题
   */
  tTitle: string;
  /**
   * 专题副标题
   */
  tSubTitle: string;
  /**
   * 文章的更新时间
   */
  lastUpdateTime: number;
  /**
   * 文章的创建时间
   */
  createTime: number;
  /**
   * 当前文章的语种
   * 0 中文 1 英文 以此类推
   */
  lang: string;
  /**
   * 当前文章插入数据库的状态
   * 默认0 未插入 1 插入成功 2 插入失败
   */
  flag: string;
}
/**
 * 分享
 */
export interface News {
  /**
   * 0 未推送 1已推送
   */
  apppush: number;
  /**
   * 资讯id
   */
  authorid: String;
  /**
   * 文章作者标题
   */
  authorName: String;
  /**
   * 文章作者标题
   */
  authorAvatar: String;
  /**
   * 快讯Id
   */
  id: string;
  /**
   * 图片地址
   */
  imgUrl: string;
  /**
   * 发布时间
   */
  publishOn: string;
  /**
   * 文章简短描述
   */
  snippet: string;
  /**
   * 资讯内容
   */
  rawContent: string;
  /**
   * 0 未审核通过 1通过
   */
  status: number;
  /**
   * 标签
   */
  tags: string;
  /**
   * 标题
   */
  title: string;
  /**
   * 0 非热门 1热门
   */
  topTime: number;
  /**
   * 生成时间
   */
  createTime: string;
  /**
   * 生成时间
   */
  updateTime: string;
  /**
   * 当前文章的语种
   * 0 中文 1 英文 以此类推
   */
  lang: string;
  /**
   * 当前文章插入数据库的状态
   * 默认0 未插入 1 插入成功 2 插入失败
   */
  flag: string;
}

export interface User {
  /**
   * 用户id
   */
  uid: string;
  /**
   * 用户名称
   */
  name: string;
  /**
   * 用户头像
   */
  logoUrl: string;
  /**
   * 用户id
   */
  phone: string;
  /**
   * 用户名称
   */
  email: string;
  /**
   * 用户名称
   */
  password: string;
  /**
   * 用户名称
   */
  descp: string;
  /**
   * 用户名称
   */
  address: string;
  /**
   * 用户名称
   */
  account: string;
  /**
   * 用户id
   */
  level: string;
  /**
   * 用户名称
   */
  up: string;
}
const parser = new Parser({
  customFields: {
    item: ["media:thumbnail"],
  },
});

export interface EnrichInput {
  source: Source;
  config: Config;
}

/**
 * @returns null when enrich failed due to fatal errors
 */
export async function enrich(enrichInput: EnrichInput): Promise<EnrichSchema | null> {
  return enrichInternal(enrichInput);
}

export async function enrichArticleItem(enrichInput: EnrichInput): Promise<EnrichSchemaArticle | null> {
  const { source } = enrichInput;
  const xmlString = await downloadTextFile(source.href).catch((err) => {
    console.error(`[enrich] Error downloading source ${source.href}`);
    return "";
  });

  const rawFeed = await parser.parseString(xmlString)!.catch((err) => {
    console.error(`[enrich] Parse source failed ${source.href}`);
    throw err;
  });
  // const rawFeed = parser.parse(xmlString);
  const feed = normalizeFeed(rawFeed, source.href);
  const items = feed.items;

  const newArticlesAsync: Promise<Article | null>[] = items.map(async (item) => {
    const title = item.title ?? "";
    const link = item.link;

    if (!link) return null;

    const enrichedItem = isItemEnrichable(item) ? await enrichItem(link) : unenrichableItem;
    const rawContent = getSummary({ parsedItem: item, enrichedItem });
    const snippet = getSnippets({ parsedItem: item, enrichedItem });
    const publishOn = item.isoDate ?? enrichedItem.publishedTime?.toISOString() ?? new Date().toISOString();
    // id 让数据库来生成
    const id = hashUniqueId(title);
    const imgUrl = item.imageUrl ?? enrichedItem.imageUrl ?? "";
    // 是否置顶
    const topTime = isTopPin(source.title);
    const tags = getTagsByTitle(item.title as string);
    // 是否Banner
    const enrichedArticle: Article = {
      id,
      authorid: hashUniqueId(source.title),
      authorName: source.title,
      authorAvatar: source.logo,
      topTime,
      tags,
      snippet,
      rawContent,
      publishOn: getCurrentTime(publishOn),
      title,
      imgUrl,
      apppush: 0,
      status: 1,
      createTime: getCurrentTime(),
      updateTime: getCurrentTime(),
    };

    return enrichedArticle;
  });

  const newArticles = (await Promise.all(newArticlesAsync)).filter((article) => article !== null) as Article[];
  const renderedArticles = newArticles.sort((a, b) => b.publishOn.localeCompare(a.publishOn));

  return {
    articles: renderedArticles,
  };
}

async function enrichInternal(enrichInput: EnrichInput): Promise<EnrichSchema | null> {
  const { source } = enrichInput;
  const xmlString = await downloadTextFile(source.href).catch((err) => {
    console.error(`[enrich] Error downloading source ${source.href}`);
    return "";
  });

  const rawFeed = await parser.parseString(xmlString)!.catch((err) => {
    console.error(`[enrich] Parse source failed ${source.href}`);
    throw err;
  });
  // const rawFeed = parser.parse(xmlString);
  const feed = normalizeFeed(rawFeed, source.href);
  const items = feed.items;

  const newArticlesAsync: Promise<News | null>[] = items.map(async (item) => {
    const title = item.title ?? "";
    const link = item.link;

    if (!link) return null;

    const enrichedItem = isItemEnrichable(item) ? await enrichItem(link) : unenrichableItem;
    const rawContent = getSummary({ parsedItem: item, enrichedItem });
    const snippet = getSnippets({ parsedItem: item, enrichedItem });
    const publishOn = item.isoDate ?? enrichedItem.publishedTime?.toISOString() ?? new Date().toISOString();
    // id 让数据库来生成
    const id = hashUniqueId(title);
    const imgUrl = item.imageUrl ?? enrichedItem.imageUrl ?? "";
    // 是否置顶
    const topTime = isTopPin(source.title);
    const tags = getTagsByTitle(item.title as string);
    // 是否Banner
    const enrichedArticle: News = {
      id,
      authorid: hashUniqueId(source.title),
      authorName: source.title,
      authorAvatar: source.logo,
      topTime,
      tags,
      snippet,
      rawContent,
      publishOn: getCurrentTime(publishOn),
      title,
      imgUrl,
      apppush: 0,
      status: 1,
      createTime: getCurrentTime(),
      updateTime: getCurrentTime(),
    };

    return enrichedArticle;
  });

  const newArticles = (await Promise.all(newArticlesAsync)).filter((article) => article !== null) as News[];
  const renderedArticles = newArticles.sort((a, b) => b.publishOn.localeCompare(a.publishOn));

  return {
    articles: renderedArticles,
  };
}

export interface EnrichItemResult {
  description: string | null;
  wordCount: number;
  publishedTime: Date | null;
  imageUrl: string | null;
  logoUrl: string | null;
}

async function enrichItem(link: string): Promise<EnrichItemResult> {
  // 直接走爬虫？可以有
  // 把爬回来的内容直接放到数据库中
  // 但是得考虑爬虫的实效性和如果代理被封了怎么办？回退方案是什么？
  try {
    const responseHtml = await downloadTextFile(link);

    const $ = cheerio.load(responseHtml);
    const plainText = $.root().text();

    const wordCount = plainText.split(/\s+/).length;

    let description = $(`meta[property="og:description"]`).attr("content") ?? null;
    if (!description?.length) {
      description = $(`meta[name="twitter:description"]`).attr("content") ?? null;
    }
    if (!description?.length) {
      description = $(`meta[name="description"]`).attr("content") ?? null;
    }
    description = description?.length ? removeHtmlEmptyTags(description) : null;

    let publishedTime: Date | null = null;
    const publishedTimeString = $(`meta[property="article:published_time"]`).attr("content") ?? null;
    if (publishedTimeString) {
      try {
        publishedTime = new Date(publishedTimeString);
      } catch (error) {
        console.log(`[enrish] Parse time error ${link}`);
      }
    }

    const imageUrl = $(`meta[property="og:image"]`).attr("content") ?? null;
    const logoUrl = $('link[rel="icon"]').attr("href") ?? null;

    const enrichItemResult: EnrichItemResult = {
      description,
      wordCount,
      publishedTime,
      imageUrl,
      logoUrl,
    };

    return enrichItemResult;
  } catch (err) {
    console.log(`[enrich] Error enrich ${link}`);
    console.log(`[enrich] Recover: plain content used for ${link}`);
    return unenrichableItem;
  }
}

const unenrichableItem: EnrichItemResult = {
  description: null,
  wordCount: 0,
  publishedTime: null,
  imageUrl: null,
  logoUrl: null,
};

// TODO improve summary accuracy
// when `content:encodedSnippet` exists and differs from content, we can assume content is the summary.
function getSummary(input: GetSummaryInput): string {
  return getFirstNonNullItem(
    input.parsedItem.summary,
    input.parsedItem.content ? removeHtmlEmptyTags(input.parsedItem.content) : null,
    input.enrichedItem.description,
    ""
  );
}
function getSnippets(input: GetSummaryInput): string {
  return getFirstNonNullItem(
    input.parsedItem.summary,
    input.parsedItem.snippet ? input.parsedItem.snippet : null,
    input.enrichedItem.description,
    ""
  );
}
interface GetSummaryInput {
  parsedItem: ParsedFeedItem;
  enrichedItem: EnrichItemResult;
}

const NO_ENRICH_URL_PATTERNS = ["^https?://www.youtube.com/watch"]; // Huge payload with anti crawler

function isItemEnrichable(item: ParsedFeedItem): boolean {
  if (!item.link) return false;
  if (item.itunes) return false;
  if (NO_ENRICH_URL_PATTERNS.some((pattern) => item.link!.match(pattern))) return false;

  return true;
}
