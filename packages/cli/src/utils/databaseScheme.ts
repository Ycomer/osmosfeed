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
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

// 资讯的结构表
export const NewsParams = {
  TableName: "NEWS",
  BillingMode: "PROVISIONED",
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
  AttributeDefinitions: [
    {
      AttributeName: "hashid",
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

// 资讯的结构表
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
