import { ddbClient, ddbDocClient } from "./ddbClient";
import { CreateTableCommand, ListTablesCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ArticleParams, NewsParams, UsersParams } from "../utils/databaseScheme";
import { ArticleItem, NewsItem, CustmorItem } from "../utils/dataBaseValue";
import { queryFlagStatus, updateFlagStatus } from "../utils/dataBaseOperation";
import { News } from "./enrich";

export const TableList = [
  { name: "ARTICLE", param: ArticleParams, item: (value: any) => ArticleItem(value) },
  { name: "NEWS", param: NewsParams, item: (value: any) => NewsItem(value) },
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
  if (table) {
    try {
      // 插入数据到具体的数据库中
      await putDataToDataBase({
        TableName: tableName,
        Item: table.item(value),
      });
      console.log("数据插入成功");
    } catch (error) {
      console.log(error, "write error");
      // 处理插入失败的情况
    }
  } else {
    console.error(`Table ${tableName} not found in TableList.`);
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
  } catch (err) {
    console.log("Error", err);
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
  } catch (err) {
    console.error(err);
  }
};

export const putDatasToDB = async (list: News[], name: string) => {
  for (const item of list) {
    try {
      await putDataToSpecificTable(item, name);
      // 如果插入成功，将表中的flag字段更新为1
      await updateTableSpecificData(name, item.publishOn, item.id, 1);
    } catch (error) {
      console.log(error);
      // 失败后将A中的flag字段更新为2
      await updateTableSpecificData(name, item.publishOn, item.id, 2);
    }
  }
};
