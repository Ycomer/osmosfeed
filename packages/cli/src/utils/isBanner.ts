function isBannerPin(item: string) {
  let topWhitelist = ["ETH"];
  return topWhitelist.includes(item) ? 1 : 0;
}

export { isBannerPin };
