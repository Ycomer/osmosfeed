import { Article } from "../types";
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

export function isIntrenalUrl(fromUrl: string, toUrl: string) {
  const fromUrlPath = new URL(fromUrl);
  const toUrlPath = new URL(toUrl);
  return fromUrlPath.origin === toUrlPath.origin;
}
