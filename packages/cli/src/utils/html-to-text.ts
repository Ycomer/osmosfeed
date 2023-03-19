import entities = require("entities");

/**
 * Credit:
 * https://github.com/rbren/rss-parser/blob/master/lib/utils.js
 * rbren + multiple contributors
 * MIT License
 */
export function htmlToText(htmlString: string): string {
  // Replace block element with line break
  let str = htmlString.replace(
    /([^\n])<\/?(h|br|p|ul|ol|li|blockquote|section|table|tr|div)(?:.|\n)*?>([^\n])/gm,
    "$1\n$3"
  );

  // Remove all other tags
  str = str.replace(/<(?:.|\n)*?>/gm, "").trim();

  return entities.decodeHTML(str).trim();
}

export function removeHtmlEmptyTags(html: string) {
  // 匹配空标签正则表达式
  const emptyTagRegex = /<[^\/>][^>]*><\/[^>]+>|<[^\/>][^>]*\/>/gi;
  // 使用 replace() 方法替换匹配到的空标签
  const filteredHtml = html.replace(emptyTagRegex, (match) => {
    if (match.trim() === "<br/>" || match.trim() === "<br>") {
      return match;
    } else {
      return "";
    }
  });

  return filteredHtml;
}
