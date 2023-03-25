import { hashUniqueId, getCurrentTime } from "../utils/random";
import { isTopPin } from "../utils/top";
import { getTagsByTitle } from "../utils/tags";
import { Article, User, ColumnArticle, Source } from "../types";
import { getIdWithType, getUUID, seedHashId } from "../utils/random";

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
  const articletype = getIdWithType(source.type).typeId;
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
    type: articletype,
    wordCount: 0,
    status: 1,
    tags,
    imgUrl,
    snippet,
    rawContent,
    apppush: 0,
    cid: uid,
    lang: item.lang,
    flag: 0,
    tTitle: "",
    tSubTitle: "",
    authorName: item.authorName,
    authorAvatar: item.authorAvatar,
    lastUpdateTime: getCurrentTime(),
    createTime: getCurrentTime(),
  };

  const enrichUser: User = {
    id: userId, // id使用的是带有前缀uuid 用来区分专栏/专题/资讯
    uid: uid, // uid 使用用户的昵称的hash作为种子生成的id
    type: articletype,
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
