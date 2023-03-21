// 查询flag的状态
export const queryFlagStatus = (name: string, hashid: string) => {
  return {
    TableName: name,
    KeyConditionExpression: "hash = :hash",
    ExpressionAttributeValues: {
      ":hash": { S: hashid },
    },
    ProjectionExpression: "flag",
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
