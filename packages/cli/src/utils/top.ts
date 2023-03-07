function isTopPin(item: string) {
  let topWhitelist = ["SophonLabs"];
  return topWhitelist.includes(item);
}

export { isTopPin };
