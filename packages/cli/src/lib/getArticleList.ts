import axios from "axios";
import * as Cheerio from "cheerio";
import puppeteer from "puppeteer";
import { uploadImageAndGetPath, uploadImageAndGetPathFromList } from "../utils/getimage";
import { ArticleSource, ColumnArticle } from "./enrich";
import { getOriginFromUrl } from "../utils/url";

// 解析列表页文章信息
// todo
// 爬之 先跟数据库对比 如果当前文章的时间小于数据库中的时间 则不再爬取
// 每爬一条数往进插入一条数据， 需要比对 然后再查一下最新的， 如果最新的时间小于当前的时间 则不再爬取

const parseArticle = async (element: any, colum: ArticleSource) => {
  const article: any = {};
  article.title = element.find(".topic-body-title").text();
  article.descp = element.find(".topic-body-content").text();
  article.publishon = element.find(".topic-time").text();
  // 讲图片也上传
  const imgUrl = element.find(".topic-content-right img").attr("src") as string;
  console.log(imgUrl, "asdasdasdas");
  article.imgUrl = await uploadImageAndGetPath(imgUrl);
  article.url = element.find(".topic-body a").attr("href");
  article.lang = colum.lang;
  article.authorName = element.find(".topic-author").text();
  article.authorAvatar = await uploadImageAndGetPath(colum.logo);
  return article;
};

// 解析详情页文章数据 并替换文章的图片信息
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
const getArticleList = async (colum: ArticleSource): Promise<ColumnArticle[]> => {
  try {
    const site = colum.href;
    const browser = await puppeteer.launch();
    const pageInstance = await browser.newPage();
    await pageInstance.goto(site);
    let articles: ColumnArticle[] = [];
    let endFlag = false;
    while (!endFlag) {
      const response = await axios.get(pageInstance.url());
      const $ = Cheerio.load(response.data);
      const newsItems = $(".topic-content");
      let lastArticleIndex = articles.length;

      for (let i = 0; i < newsItems.length; i++) {
        const element = $(newsItems[i]);
        const article = await parseArticle(element, colum);
        // 因为不再一个层级
        article.authorBrief = $(".item-wrap-top .item-avatar-brief").text();
        if (article.url !== articles[lastArticleIndex - 1]?.url) {
          articles.push(article);
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

    // 获取每篇文章的详情数据
    for (let article of articles) {
      const origin = getOriginFromUrl(colum.href);
      article.content = await parseDetail(`${origin}${article.url}`);
    }

    await browser.close();

    return articles;
  } catch (error) {
    console.log(error, "errprrrrrr");
    throw new Error("Failed to get article list");
  }
};

const getAllColumnArticles = async (colum: ArticleSource) => {
  const articlelist = await getArticleList(colum);
  return articlelist;
};

export { getAllColumnArticles };
