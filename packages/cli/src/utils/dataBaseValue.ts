// 拼装 dynamodb Item 的数据，以方便将洗好的数据写入
import { Article, User } from "../types";
import { marshall } from "@aws-sdk/util-dynamodb";
export const ArticleItem = (item: Article) => {
  return marshall({
    id: item.id,
    aid: item.aid,
    hashid: item.hashId,
    publishon: item.publishOn,
    title: item.title,
    toptime: item.topTime,
    bannertime: item.bannerTime,
    hottime: item.hotTime,
    type: item.type,
    wordcount: item.wordCount,
    status: item.status,
    tags: item.tags,
    imgurl: item.imgUrl,
    snippet: item.snippet,
    rawcontent: item.rawContent,
    apppush: item.apppush,
    cid: item.cid,
    lang: item.lang,
    flag: item.flag,
    ttitle: item.tTitle,
    tsubtitle: item.tSubTitle,
    lastudatetime: item.lastUpdateTime,
    createtime: item.createTime,
  });
};

export const CustmorItem = (item: User) => {
  return marshall({
    id: item.id,
    uid: item.uid,
    phone: item.phone,
    type: item.type,
    name: item.name,
    address: item.address,
    email: item.email,
    dsecp: item.descp,
    password: item.password,
    logourl: item.logoUrl,
    account: item.account,
    level: item.level,
    up: item.up,
  });
};
