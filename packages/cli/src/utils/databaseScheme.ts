// create DynamoDB Table

// 文章结构表
export const ArticleParams = {
  TableName: "ARTICLE",
  KeySchema: [
    {
      AttributeName: "id",
      KeyType: "HASH",
    },
    {
      AttributeName: "hashid",
      KeyType: "RANGE",
    },
  ],
  BillingMode: "PROVISIONED",
  AttributeDefinitions: [
    {
      AttributeName: "id",
      AttributeType: "S",
    },
    {
      AttributeName: "hashid",
      AttributeType: "S",
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

// 用户的结构表
export const UsersParams = {
  TableName: "USER",
  BillingMode: "PROVISIONED",
  KeySchema: [
    {
      AttributeName: "id",
      KeyType: "HASH",
    },
    {
      AttributeName: "email",
      KeyType: "RANGE",
    },
  ],
  AttributeDefinitions: [
    {
      AttributeName: "id",
      AttributeType: "S",
    },
    {
      AttributeName: "email",
      AttributeType: "S",
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};
