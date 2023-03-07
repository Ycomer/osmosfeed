// 后续可以根据AI回答的内容然后比对数据库之后给出答案
// v1 随机返回文章数组
function isHotArticle(item: string) {
  let topWhitelist = ["ETH"];
  return { isHot: topWhitelist.includes(item), hotScore: Math.floor(Math.random() * 1000000) };
}

export { isHotArticle };
