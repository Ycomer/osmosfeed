import axios from "axios";
import * as Cheerio from "cheerio";
import puppeteer from "puppeteer";
import { uploadImageAndGetPath, uploadImageAndGetPathFromList } from "../utils/getimage";
import { Article, ArticleSource, ColumnArticle } from "../types";
import { getOriginFromUrl, isIntrenalUrl } from "../utils/url";
import { enrichSingleArticle } from "../lib/enrich";
import {
  putDataToUserDB,
  putDatasToDB,
  queryArticlePublish,
  queryUserIdStatus,
  queryUsersNewArticle,
} from "../lib/awsDynamodb";

// 解析列表页文章信息
// todo

const parseArticle = async (element: any, colum: ArticleSource) => {
  const article: any = {};
  article.title = await element.$eval(".topic-body-title", (title) => title.innerText || "");
  article.descp = await element.$eval(".topic-body-content", (descp) => descp.innerText || "");
  article.publishon = await element.$eval(".is-top", (publishon) => publishon.innerText || "");
  // 讲图片也上传
  const imageElements = await element.$$(".topic-content .topic-content-right img[src]");
  const imgUrlArr = await Promise.all(imageElements.map((img) => img.evaluate((i) => i.src)));
  const imgUrl = imgUrlArr[0] || "";
  if (imgUrl) {
    article.imgUrl = await uploadImageAndGetPath(imgUrl);
  } else {
    article.imgUrl = "";
  }
  article.url = await element.$eval(".topic-body a", (url) => url.href || "");
  article.lang = colum.lang;
  article.authorName = colum.title;
  article.authorAvatar = "";
  return article;
};

// 解析详情页文章数据 并替换文章的图片信息
// const parseDetail = async (url: any) => {
//   const browser = await puppeteer.launch();
//   const pageInstance = await browser.newPage();
//   await pageInstance.goto(url, { waitUntil: "domcontentloaded" });
//   const imageElements = await pageInstance.$$(".topic-content .topic-content-right img[src]");
//   const imageUrls = await Promise.all(imageElements.map((img) => img.evaluate((i) => i.src)));
//   const imagePaths = await uploadImageAndGetPathFromList(imageUrls);
//   // 更新详情页面中的所有图片链接
//   for (let i = 0; i < imagePaths.length; i++) {
//     const img = imagePaths[i];
//     await pageInstance.evaluate(
//       (el, url) => {
//         el.src = url;
//       },
//       img,
//       url[i]
//     );
//   }

//   await pageInstance.$eval("p", (p) => {
//     if (p) {
//       p.removeAttribute("class");
//     }
//   });
//   const content = await pageInstance.$eval(".detail-body", (content) => content.innerHTML || "");
//   await browser.close();
//   return content;
// };
const parseDetail = async (url: any) => {
  const data = await axios.get(url);
  const $ = Cheerio.load(data.data);
  const imageUrls: any = []; // 每个文章都需要重新定义图片链接数组
  $(".detail-body img").each((index, element) => {
    imageUrls.push($(element).attr("src"));
  });
  const imagePaths = await uploadImageAndGetPathFromList(imageUrls);
  $(".detail-body img").each((index, element) => {
    $(element).attr("src", imagePaths[index]);
  });
  $("p").removeAttr("class");
  $("strong").removeAttr("style");
  const content = $(".detail-body").html() as string;
  return content;
};

// 获取文章列表数据
const getTopicList = async (colum: ArticleSource): Promise<Article[]> => {
  try {
    const site = colum.href;
    const origin = getOriginFromUrl(colum.href);
    const browser = await puppeteer.launch();
    const pageInstance = await browser.newPage();
    await pageInstance.goto(site);
    let articles: ColumnArticle[] = [];
    let finalAtcile: Article[] = [];
    let endFlag = false;
    while (!endFlag) {
      const authorBrief = await pageInstance.$eval(".content-top span", (brief) => brief.innerText);
      const newsItems = await pageInstance.$$(".el-timeline-item__wrapper");

      let lastArticleIndex = articles.length;

      for (let i = 0; i < newsItems.length; i++) {
        const element = newsItems[i];
        const article = await parseArticle(element, colum);
        article.authorBrief = authorBrief;
        // 需要判断下url是外链还是内容链接
        if (isIntrenalUrl(article.url, origin as string)) {
          article.content = await parseDetail(`${article.url}`);
        }
        if (article.url !== articles[lastArticleIndex - 1]?.url) {
          // 爬之先跟数据库对比 如果当前文章的时间小于数据库中的时间 则不再爬取
          // 插入之前先把文章的数据结构更新好
          // 每爬一条数往进插入一条数据，需要比对 然后再查一下最新的，如果最新的时间小于当前的时间 则不再爬取
          // 上传成功以后再返回
          try {
            // 需要优化下，在没有判定当前专栏是否已经存在之前不做任何上传操作
            const richArtcle = await enrichSingleArticle(article, colum);
            console.log(richArtcle, "richArtcle");
            // 查询作者是否已经写入
            const resUser = await queryUserIdStatus("USER", richArtcle.enrichUser.uid);
            // 查询当前用户最新的文章
            const resArticle = await queryUsersNewArticle("ARTICLE", richArtcle.enrichedArticle.cid);

            if (resArticle) {
              const { Count: articleCount, Items } = resArticle;
              if (
                articleCount > 0 &&
                Number(richArtcle.enrichedArticle.publishOn) > Number(Items && Items[0].publishon.S)
              ) {
                endFlag = true;
                break;
              } else {
                await putDatasToDB(richArtcle.enrichedArticle, "ARTICLE");
                //库里没有才插入
                finalAtcile.push(richArtcle.enrichedArticle);
              }
            }

            if (resUser) {
              const { Count: userCount, Items: userItems } = resUser;
              if (userCount === 0) {
                await putDataToUserDB(richArtcle.enrichUser, "USER");
              }
            }
          } catch (error) {
            console.log(error, "error");
            throw new Error("Failed to enrich article");
          }
        }
      }

      let nextBtn = await pageInstance.$(".load-more");
      if (!nextBtn) {
        endFlag = true;
      } else {
        await nextBtn.click();
        await pageInstance.waitForSelector(".load-more", {
          hidden: true,
        });
      }
    }
    await browser.close();
    return finalAtcile;
  } catch (error) {
    console.log(error, "cknima");
    throw new Error("Failed to get topic article list", error);
  }
};

const getAllTopicArticles = async (colum: ArticleSource) => {
  if (colum.type !== 1) return [];
  const articlelist = await getTopicList(colum);
  return articlelist;
};

export { getAllTopicArticles };
