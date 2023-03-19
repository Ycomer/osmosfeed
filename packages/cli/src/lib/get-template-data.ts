import { htmlToText } from "../utils/html-to-text";
import { cliVersion } from "../utils/version";
import type { EnrichedArticle, EnrichSchema } from "./enrich";
import type { Config } from "./get-config";
import { FEED_FILENAME } from "./render-atom";
import { getDateFromIsoString, getIsoTimeWithOffset } from "./time";

interface TemplateArticle extends EnrichedArticle {
  source: EnrichSchema;
  /**
   * @deprecated This date should only be used by the server internally.
   * Use `isoUtcPublishTime` for high-fidelity timestamp or `isoOffsetPublishDate` for grouping by dates
   */
  isoPublishDate: string;
  /**
   * The publish date in user's specified timezone (UTC by default)
   */
  isoOffsetPublishDate: string;
  /**
   * The publish time in UTC timezone
   */
  isoUtcPublishTime: string;
  readingTimeInMin: number;
}

interface TemplateSource extends TemplateSourceBase {
  dates: {
    /**
     * @deprecated This date should only be used by the server internally.
     * Use `isoUtcPublishTime` for high-fidelity timestamp or `isoOffsetPublishDate` for grouping by dates
     */
    isoPublishDate: string;
    isoOffsetPublishDate: string;
    isoUtcPublishTime: string;
    articles: TemplateArticle[];
  }[];
}

interface TemplateDates {
  /**
   * @deprecated This date should only be used by the server internally.
   * Use `isoUtcPublishTime` for true timestamp or `isoOffsetPublishDate` for grouping by dates
   */
  isoPublishDate: string;
  isoOffsetPublishDate: string;
  isoUtcPublishTime: string;
  articles: TemplateArticle[];
  sources: TemplateSourceBase[];
}

interface TemplateSourceBase extends EnrichSchema {
  isoOffsetPublishDate: string;
  isoUtcPublishTime: string;
  articles: TemplateArticle[];
}

export interface GetTemplateDataInput {
  enrichedSources: EnrichSchema[];
  config: Config;
}

function getTimestamps(isoUtcTimestamp: string, timezoneOffset: number) {
  const isoOffsetTime = getIsoTimeWithOffset(isoUtcTimestamp, timezoneOffset);
  return {
    isoUtcPublishTime: isoUtcTimestamp,
    isoOffsetPublishDate: getDateFromIsoString(isoOffsetTime),
  };
}

function organizeByArticles(input: GetTemplateDataInput): TemplateArticle[] {
  const articles: TemplateArticle[] = input.enrichedSources
    .flatMap((enrichedSource) =>
      enrichedSource.articles.map((article) => ({
        ...article,
        source: enrichedSource,
        isoPublishDate: getDateFromIsoString(article.publishedOn),
        ...getTimestamps(article.publishedOn, input.config.timezoneOffset),
        title: ensureDisplayString(htmlToText(article.title), "Untitled"),
        description: ensureDisplayString(htmlToText(article.description), "No content preview"),
        readingTimeInMin: Math.round((article.wordCount ?? 0) / 300),
      }))
    )
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)); // by time, most recent first
  return articles;
}

function organizeBySources(input: GetTemplateDataInput): TemplateSource[] {
  const articles = organizeByArticles(input);

  const articlesBySource = groupBy(articles, (article) => article.source);
  const sortedArticlesBySource = [...articlesBySource.entries()].map(([source, articles]) => ({
    ...source,
    ...getTimestamps(articles[0].isoUtcPublishTime, input.config.timezoneOffset),
    articles: articles.sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)), // by date, most recent first
    dates: [...groupBy(articles, (article) => article.isoOffsetPublishDate)]
      .sort((a, b) => b[0].localeCompare(a[0])) // by date, most recent first
      .map(([date, articles]) => ({
        isoPublishDate: date,
        ...getTimestamps(articles[0].isoUtcPublishTime, input.config.timezoneOffset),
        articles,
      })),
  }));

  return sortedArticlesBySource;
}

function organizeByDates(input: GetTemplateDataInput): TemplateDates[] {
  const articles = organizeByArticles(input);

  const articlesByDate = groupBy(articles, (article) => article.isoOffsetPublishDate);
  const sortedArticlesByDate = [...articlesByDate.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])) // by date, most recent first
    .map(([date, articles]) => ({
      isoPublishDate: date,
      ...getTimestamps(articles[0].isoUtcPublishTime, input.config.timezoneOffset),
      articles,
      sources: [...groupBy(articles, (articles) => articles.source).entries()]
        .sort((a, b) => b[1][0].isoUtcPublishTime.localeCompare(a[1][0].isoUtcPublishTime)) // by date, most recent first
        .map(([source, articles]) => ({
          ...source,
          ...getTimestamps(articles[0].isoUtcPublishTime, input.config.timezoneOffset),
          articles,
        })),
    }));

  return sortedArticlesByDate;
}

function groupBy<T, K>(array: T[], selector: (item: T) => K) {
  const result = new Map<K, T[]>();
  return array.reduce((latest, item) => {
    const feature = selector(item);

    if (!latest.has(feature)) {
      latest.set(feature, [item]);
    } else {
      latest.get(feature)!.push(item);
    }

    return latest;
  }, result);
}

function ensureDisplayString(input: string | null | undefined, fallback: string) {
  return input?.length ? input : fallback;
}
