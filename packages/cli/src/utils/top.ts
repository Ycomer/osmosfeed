function isTopPin(item: string) {
  let topWhitelist = ["SophonLabs"];
  return topWhitelist.includes(item) ? 1 : 0;
}

export { isTopPin };
