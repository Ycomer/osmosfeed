// 以日期为后缀的缓存文件名, 仅使用年-月-日
function cacheName(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}${month}${day}.json`;
}

export { cacheName };
