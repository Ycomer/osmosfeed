// 查询flag的状态
export const queryFlagStatus = (name: string, id: string) => {
  return {
    TableName: name,
    KeyConditionExpression: "hashid = :hashid",
    ExpressionAttributeValues: {
      ":hashid": { S: id },
    },
    ProjectionExpression: "flag",
  };
};
// 查询发布日期
export const queryPublishOnStatus = (name: string, hashid: string) => {
  return {
    TableName: name,
    KeyConditionExpression: "hashid = :hashid",
    ExpressionAttributeValues: {
      ":hashid": { S: hashid },
    },
    ProjectionExpression: "publishon",
  };
};

// 查询用户id
export const queryUserId = (name: string, uid: string) => {
  return {
    TableName: name,
    KeyConditionExpression: "uid = :uid",
    ExpressionAttributeValues: {
      ":uid": { S: uid },
    },
    ProjectionExpression: "uid",
  };
};
// 查询用户最新的文章
export const queryUserNewArticle = (name: string, hashid: string) => {
  return {
    TableName: name,
    KeyConditionExpression: "hashid = :hashid",
    ExpressionAttributeValues: {
      ":hashid": { S: hashid },
    },
    ScanIndexForward: false, // 倒序排序
    Limit: 1, // 返回最新的文章
    ProjectionExpression: "publishon",
  };
};
// 更新flag的状态
export const updateFlagStatus = (name: string, hashid: string, id: string, value: number) => {
  return {
    TableName: name,
    Key: {
      hashid: hashid,
      id: id,
    },
    ProjectionExpression: "#flag",
    ExpressionAttributeNames: {
      "#flag": "flag",
    },
    UpdateExpression: "set #flag = :f",
    ExpressionAttributeValues: {
      ":f": value,
    },
  };
};
// 查询id的值
export const queryAutoInCreIdValue = (name: string, id: string) => {
  return {
    TableName: name,
    KeyConditionExpression: "id = :id",
    Limit: 1,
    ScanIndexForward: false,
    ExpressionAttributeValues: {
      ":id": { S: id },
    },
    ProjectionExpression: "id",
  };
};

//查询当前用户的最新文章
export const queryCurrentUserNewArticle = (name: string, cid: string) => {
  return {
    TableName: name,
    IndexName: "cid-index", // 使用 cid-publishon 索引进行查询
    KeyConditionExpression: "cid = :cid",
    ExpressionAttributeValues: {
      ":cid": { S: cid },
    },
    ScanIndexForward: false, // 倒序排序
    Limit: 1, // 返回最新的文章
  };
};
