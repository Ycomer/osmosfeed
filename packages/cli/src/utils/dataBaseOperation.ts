export const queryFlagStatus = (name: string, publishon: string) => {
  return {
    TableName: name,
    Key: {
      publishon: publishon,
    },
    ProjectionExpression: "flag",
  };
};

export const updateFlagStatus = (name: string, publishon: string, value: number) => {
  return {
    TableName: name,
    Key: {
      publishon: { S: publishon },
    },
    UpdateExpression: "set #flag = :f",
    ExpressionAttributeNames: {
      "#flag": "flag",
    },
    ExpressionAttributeValues: {
      ":f": { N: value },
    },
    ReturnValues: "UPDATED_NEW",
  };
};
