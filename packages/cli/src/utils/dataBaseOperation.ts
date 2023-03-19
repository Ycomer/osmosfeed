export const queryFlagStatus = (name: string, publishon: string) => {
  return {
    TableName: name,
    KeyConditionExpression: "publishon = :publishon",
    ExpressionAttributeValues: {
      ":publishon": { S: publishon },
    },
    ProjectionExpression: "flag",
  };
};

export const updateFlagStatus = (name: string, publishon: string, id: string, value: number) => {
  return {
    TableName: name,
    Key: {
      publishon: publishon,
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
