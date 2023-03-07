export const TagList = [
  "智能合约",
  "公链",
  "Web3",
  "Sophon原创",
  "DeFi",
  "元宇宙",
  "NFT",
  "Layer2",
  "空投",
  "DAO",
  "Sui",
  "Aptos",
  "以太坊",
  "链游",
];

// 根据文章的内容，自动给文章打标签
function getTagsByTitle(title: any) {
  return TagList.map((tag) => (title.search(tag) !== -1 ? tag : -1)).filter((tag) => tag !== -1);
}

export { getTagsByTitle };
