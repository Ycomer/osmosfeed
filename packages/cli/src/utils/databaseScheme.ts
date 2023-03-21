// create DynamoDB Table

// 文章结构表
export const ArticleParams = {
  TableName: "ARTICLE",
  KeySchema: [
    {
      AttributeName: "hashid",
      KeyType: "HASH",
    },
    {
      AttributeName: "id",
      KeyType: "RANGE",
    },
  ],
  BillingMode: "PROVISIONED",
  AttributeDefinitions: [
    {
      AttributeName: "hashid",
      AttributeType: "S",
    },
    {
      AttributeName: "id",
      AttributeType: "S",
    },
    {
      AttributeName: "cid",
      AttributeType: "S",
    },
  ],

  GlobalSecondaryIndexes: [
    {
      IndexName: "cid-index",
      KeySchema: [
        { AttributeName: "cid", KeyType: "HASH" },
        { AttributeName: "id", KeyType: "RANGE" },
      ],
      Projection: {
        ProjectionType: "ALL",
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
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
      AttributeName: "uid",
      KeyType: "HASH",
    },
    {
      AttributeName: "id",
      KeyType: "RANGE",
    },
  ],
  AttributeDefinitions: [
    {
      AttributeName: "uid",
      AttributeType: "S",
    },
    {
      AttributeName: "id",
      AttributeType: "S",
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};
