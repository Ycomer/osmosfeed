export interface Source {
  href: string;
  title: string;
  logo: string;
  type: number;
  lang: number;
}

export interface Config {
  sources: Source[];
}
export interface EnrichInput {
  source: Source;
  config: Config;
}

export interface ArticleSource {
  title: string;
  href: string;
  type: number;
  lang: number;
  logo: string;
}

export interface ColumnArticle {
  url: string;
  title: string;
  content: string;
  publishon: number;
  imgUrl: string;
  descp: string;
  lang: number;
  authorName: string;
  authorAvatar: string;
  authorBrief: string;
}

export interface Article {
  /**
   * 是否通过app推送 0未推送 1推送
   */
  apppush: number;
  /**
   * 是否存在顶部swiper 0 不存在 1存在
   */
  bannerTime: number;
  /**
   * 热门文章 0 不是 1是
   */
  hotTime: number;
  /**
   * 文章id
   */
  id: string;
  /**
   * 文章暴露给前端的id
   */
  aid: string;
  /**
   * 文章唯一id
   */
  hashId: string;
  /**
   * 文章图
   */
  imgUrl: string;
  /**
   * 发布时间
   */
  publishOn: number;
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
  tags: string;
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
   * 专栏和专栏id 通过前面的_签名的内容区分
   */
  cid: string;
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
  lang: number;
  /**
   * 当前文章插入数据库的状态
   * 默认0 未插入 1 插入成功 2 插入失败
   */
  flag: number;
  /**
   * 作者名称
   */
  authorName: string;
  /**
   * 作者头像
   */
  authorAvatar: string;
}
export interface User {
  /**
   * 用户id
   */
  id: string;
  /**
   * 用户唯一id
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
  /**
   * 类目 0 是资讯 1专题 2专栏
   */
  type: number;
}
