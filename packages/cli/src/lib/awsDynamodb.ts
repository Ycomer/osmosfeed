import { ddbClient, ddbDocClient } from "./ddbClient";
import { CreateTableCommand, ListTablesCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ArticleParams, UsersParams } from "../utils/databaseScheme";
import { ArticleItem, CustmorItem } from "../utils/dataBaseValue";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import {
  queryFlagStatus,
  updateFlagStatus,
  queryAutoInCreIdValue,
  queryPublishOnStatus,
  queryUserId,
  queryCurrentUserNewArticle,
} from "../utils/dataBaseOperation";
import { Article } from "../types";

export const TableList = [
  { name: "ARTICLE", param: ArticleParams, item: (value: any) => ArticleItem(value) },
  { name: "USER", param: UsersParams, item: (value: any) => CustmorItem(value) },
];

export const checkTableExist = async () => {
  try {
    const tableName = await listTableImme();
    const isExisted = await handleCheckTableExist(tableName);
    return isExisted;
  } catch (err) {
    console.log("Error", err);
  }
};

export const listTableImme = async () => {
  try {
    const data = await ddbClient.send(new ListTablesCommand({}));
    return data.TableNames;
  } catch (err) {
    console.log("Error", err);
  }
};

export const createTable = async (params: any) => {
  try {
    const data = await ddbClient.send(new CreateTableCommand(params));
    console.log("Table Created", data);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};

export async function handleCheckTableExist(table: any) {
  let isTableExist = false; // 增加一个变量来表示表是否存在
  for (const item of TableList) {
    if (table?.includes(item.name)) {
      console.log("Table Existed", item.name);
      isTableExist = true; // 如果表存在，将变量设置为 true
    } else {
      console.log("Table Not Existed", item.name);
      await createTable(item.param);
    }
  }
  return isTableExist; // 返回变量值
}

export const putDataToDataBase = async (params: any) => {
  try {
    const data = await ddbDocClient.send(new PutItemCommand(params));
    console.log("Table Created", data);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};

/**
 * @param value {Object} the value to be put into the database
 * @param tableName {String} the name of the table
 */
export const putDataToSpecificTable = async (value: any, tableName: string) => {
  const table = TableList.find((item) => item.name === tableName);
  if (!table) {
    throw new Error(`Table ${tableName} not found in TableList.`);
  }
  // 自增id
  // const nextId = await getAutoIncreaseId(tableName, value.id);

  try {
    // 插入数据到具体的数据库中
    await putDataToDataBase({
      TableName: tableName,
      Item: table.item(value),
    });
    console.log("数据插入成功");
  } catch (error) {
    console.error(`Error inserting data into table ${tableName}`, error);
    throw error;
  }
};

/**
 * @param params {Object} the value to be update into the database
 */
export const updateTableSpecificData = async (name: string, hashid: string, id: string, value: number) => {
  const params = updateFlagStatus(name, hashid, id, value);
  try {
    const data = await ddbDocClient.send(new UpdateCommand(params));
    console.log("Success - item added or updated", data);
    return data;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
};

/**
 * @param name {String} name of the table
 * @param params {Object} the value to be update into the database
 */
export const querySpecificTableData = async (name: string, id: string) => {
  const params = queryFlagStatus(name, id);
  try {
    const data = await ddbClient.send(new QueryCommand(params));
    return data.Count;
  } catch (error) {
    console.error(error);
    return null;
  }
};
// 查询文章的发布时间
export const queryArticlePublish = async (name: string, hash: string) => {
  const params = queryPublishOnStatus(name, hash);
  try {
    const data = await ddbClient.send(new QueryCommand(params));
    const items = data.Items?.map((item) => unmarshall(item));
    return items;
  } catch (error) {
    console.error(error, "查询出错了");
    return null;
  }
};
// 查询用户的id
export const queryUserIdStatus = async (name: string, uid: string) => {
  const params = queryUserId(name, uid);
  try {
    const data = await ddbClient.send(new QueryCommand(params));
    const items = data.Items?.map((item) => unmarshall(item));
    return items;
  } catch (error) {
    console.error(error, "查询用户出错了");
    return null;
  }
};

// 查询当前文章是否存在

export const queryUsersNewArticle = async (name: string, hashid: string) => {
  const params = queryCurrentUserNewArticle(name, hashid);
  try {
    const data = await ddbClient.send(new QueryCommand(params));
    const items = data.Items?.map((item) => unmarshall(item));
    return items;
  } catch (error) {
    console.error(error, "查询当前文章是否存在出错了");
    return null;
  }
};

// 向文章表里插入数据并更新flag字段
export const putDatasToDB = async (item: any, tableName: string) => {
  const success = await insertDataAndUpdateFlag(item, tableName);
  if (!success) {
    console.log(`Failed to insert data into ${tableName}:`, item);
  }
};

/**
 * 向表中插入数据，并根据插入结果更新表中的 flag 字段
 * @param item 要插入的数据
 * @param tableName 要插入的表名
 * @returns 是否成功插入数据
 */

const insertDataAndUpdateFlag = async (item: Article, tableName: string) => {
  try {
    await putDataToSpecificTable(item, tableName);
    await updateTableSpecificData(tableName, item.hashId, item.id, 1);
    return true;
  } catch (error) {
    console.error(`Failed to insert data into ${tableName}:`, error);
    await updateTableSpecificData(tableName, item.hashId, item.id, 2);
    return false;
  }
};

// 向用户表里传入数据
export const putDataToUserDB = async (item: any, name: string) => {
  try {
    await putDataToSpecificTable(item, name);
  } catch (error) {
    console.log(error);
  }
};

// 自增id
// async function getAutoIncreaseId(tableName: string, idName: string) {
//   const params = queryAutoInCreIdValue(tableName, idName);
//   try {
//     const data = await ddbDocClient.send(new QueryCommand(params));
//     return data.Count;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }
