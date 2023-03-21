import { ddbClient, ddbDocClient } from "./ddbClient";
import { CreateTableCommand, ListTablesCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ArticleParams, UsersParams } from "../utils/databaseScheme";
import { ArticleItem, CustmorItem } from "../utils/dataBaseValue";
import { queryFlagStatus, updateFlagStatus, queryAutoInCreIdValue } from "../utils/dataBaseOperation";
import { Article } from "../types";

export const TableList = [
  { name: "ARTICLE", param: ArticleParams, item: (value: any) => ArticleItem(value) },
  { name: "USER", param: UsersParams, item: (value: any) => CustmorItem(value) },
];

export const checkTableExist = async () => {
  try {
    const data = await ddbClient.send(new ListTablesCommand({}));
    console.log("Table Listed", data.TableNames);
    handleCheckTableExist(data.TableNames);
    return data;
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

function handleCheckTableExist(table: any) {
  TableList.forEach((item) => {
    if (table?.includes(item.name)) {
      console.log("Table Existed", item.name);
    } else {
      console.log("Table Not Existed", item.name);
      createTable(item.param);
    }
  });
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
export const updateTableSpecificData = async (name: string, pushlishon: string, id: string, value: number) => {
  const params = updateFlagStatus(name, pushlishon, id, value);
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
export const querySpecificTableData = async (name: string, pushlishon: string) => {
  const params = queryFlagStatus(name, pushlishon);
  try {
    const data = await ddbClient.send(new QueryCommand(params));
    return data.Count;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// 向文章和资讯表里插入数据（因为要对表中的字段进行更新）
export const putDatasToDB = async (list: Article[], tableName: string) => {
  for (const item of list) {
    const success = await insertDataAndUpdateFlag(item, tableName);
    if (!success) {
      console.log(`Failed to insert data into ${tableName}:`, item);
    }
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
export const putDataToDB = async (list: any, name: string) => {
  for (const item of list) {
    try {
      await putDataToSpecificTable(item, name);
    } catch (error) {
      console.log(error);
    }
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
