import { Article } from "../lib/enrich";
export function getHostnameFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (e) {
    console.error(e);
    return null;
  }
}
export function getOriginFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function resolveRelativeUrl(targetUrl: string, baseUrl: string): string | null {
  try {
    return new URL(targetUrl, baseUrl).href;
  } catch {
    return null;
  }
}

export function unionWithOutComparator<T>(array: Article[], other: Article[]): Article[] {
  const uniqueSet = new Set(other.map((item) => item.link));
  return [...other, ...array.filter((item) => !uniqueSet.has(item.link))];
}
