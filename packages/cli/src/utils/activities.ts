import { generateRandomId } from "./random";
import { getCurrentTimestamps } from "../lib/time";

const activeLists = {
  sources: [
    {
      id: generateRandomId(10),
      stime: 1677909600,
      address: "中国 香港",
      etime: 1677920400,
      media: "https://cdn-img.panewslab.com/panews/2023/02/15/images/W06avmEM1h.jpg",
      name: "ETHDenver 2023",
      owner: "ETHDenver",
      site: "https://www.ethdenver.com/",
    },
    {
      id: generateRandomId(10),
      stime: 1677909600,
      address: "中国 上海",
      etime: 1677920800,
      media: "https://cdn-img.panewslab.com/panews/2023/02/15/images/W06avmEM1h.jpg",
      name: "ETHDenver 2023",
      owner: "ETHDenver",
      site: "https://www.ethdenver.com/",
    },
  ],
};

export default activeLists;
