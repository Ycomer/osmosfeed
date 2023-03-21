import { hashUniqueId, getCurrentTime } from "../utils/random";
import { isTopPin } from "../utils/top";
import { getTagsByTitle } from "../utils/tags";
import { EnrichInput, Article, User, ColumnArticle, Source } from "../types";
import { getAllColumnArticles } from "../lib/getArticleList";
import { getAllNews } from "../lib/getAllNews";
import { getIdWithType, getUUID, seedHashId } from "../utils/random";

// 这个地方是入库的字段，出库的时候不一定要全部出库，可以根据需要出库

export async function enrichArticle(enrichInput: EnrichInput): Promise<any> {
  const { source } = enrichInput;
  // 根据不同的类型获取不同的文章
  // 讲获取到的文章拼接成数组，然后统一处理，之后插入数据库
  // 0 资讯
  const NewsLists = await getAllNews(source);
  // 2 专栏
  const ColumnLists = await getAllColumnArticles(source);
  // 3 专题
  const mutilpleLists = [...NewsLists, ...ColumnLists];
  const newArticlesAsync = mutilpleLists.map(async (item) => {
    const title = item.title;
    const rawContent = item.content;
    const snippet = item.descp;
    const publishOn = item.publishon;
    const hashId = hashUniqueId(title);
    const id = getUUID();
    const userId = getIdWithType(source.type).customId;
    const uid = seedHashId(item.authorName);
    const articleId = seedHashId(hashId);
    const imgUrl = item.imgUrl;
    // 是否置顶
    const topTime = isTopPin(source.title);
    const tags = getTagsByTitle(item.title as string);
    // 是否Banner
    const enrichedArticle: Article = {
      id,
      hashId,
      aid: articleId,
      publishOn: getCurrentTime(publishOn),
      title,
      topTime,
      bannerTime: 0,
      hotTime: 0,
      type: 0,
      wordCount: 0,
      status: 1,
      tags,
      imgUrl,
      snippet,
      rawContent,
      apppush: 0,
      cid: userId,
      lang: item.lang,
      flag: 0,
      tTitle: "",
      tSubTitle: "",
      lastUpdateTime: getCurrentTime(),
      createTime: getCurrentTime(),
    };

    const enrichUser: User = {
      id: userId, // id使用的是uuid 用来区分专栏/专题/资讯
      uid: uid, // uid 使用自增id
      type: getIdWithType(source.type).typeId,
      name: item.authorName,
      logoUrl: item.authorAvatar,
      phone: "",
      email: "",
      password: "",
      descp: item.authorBrief,
      address: "",
      account: "",
      level: "",
      up: "",
    };
    return { enrichedArticle, enrichUser };
  });

  const newArticles = await Promise.all(newArticlesAsync);
  return newArticles;
}

export async function enrichSingleArticle(item: ColumnArticle, source: Source) {
  const title = item.title;
  const rawContent = item.content;
  const snippet = item.descp;
  const publishOn = item.publishon;
  const hashId = hashUniqueId(title);
  const id = getUUID();
  const userId = getIdWithType(source.type).customId;
  const uid = seedHashId(item.authorName);
  const articleId = seedHashId(hashId);
  const imgUrl = item.imgUrl;
  // 是否置顶
  const topTime = isTopPin(source.title);
  const tags = getTagsByTitle(item.title as string);
  // 是否Banner
  const enrichedArticle: Article = {
    id,
    hashId,
    aid: articleId,
    publishOn: getCurrentTime(publishOn),
    title,
    topTime,
    bannerTime: 0,
    hotTime: 0,
    type: 0,
    wordCount: 0,
    status: 1,
    tags,
    imgUrl,
    snippet,
    rawContent,
    apppush: 0,
    cid: userId,
    lang: item.lang,
    flag: 0,
    tTitle: "",
    tSubTitle: "",
    lastUpdateTime: getCurrentTime(),
    createTime: getCurrentTime(),
  };

  const enrichUser: User = {
    id: userId, // id使用的是uuid 用来区分专栏/专题/资讯
    uid: uid, // uid 使用自增id
    type: getIdWithType(source.type).typeId,
    name: item.authorName,
    logoUrl: item.authorAvatar,
    phone: "",
    email: "",
    password: "",
    descp: item.authorBrief,
    address: "",
    account: "",
    level: "",
    up: "",
  };
  return { enrichedArticle, enrichUser };
}
