import path from "path";
import { PUBLIC_ROOT_DIR } from "./path-constants";
import { FEED_FILENAME, INDEX_FILENAME } from "./render-atom";
import { mkdirAsync, writeFileAsync } from "../utils/fs";
import { EnrichedArticle } from "./enrich";

export interface RenderFilesInput {
  detail: EnrichedArticle[];
  atom: string;
}

export async function writeFiles(input: RenderFilesInput) {
  let renderDetailAsync: Promise<string>[] = [];
  const { detail, atom } = input;

  await mkdirAsync(PUBLIC_ROOT_DIR, { recursive: true });
  detail.map((item) => {
    const dataString = JSON.stringify(item, undefined, 2);
    const detailPath = path.resolve(`${PUBLIC_ROOT_DIR}/${item.id}.json`);
    renderDetailAsync.push(writeFileAsync(detailPath, dataString).then(() => detailPath));
  });

  console.log(renderDetailAsync, "renderDetailAsyncrenderDetailAsync");
  const atomPath = path.resolve(`${PUBLIC_ROOT_DIR}/${FEED_FILENAME}`);
  const renderAtomAsync = writeFileAsync(atomPath, atom).then(() => atomPath);

  return Promise.all([...renderDetailAsync, renderAtomAsync]);
}
