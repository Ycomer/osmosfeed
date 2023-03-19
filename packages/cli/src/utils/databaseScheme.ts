// create DynamoDB Table

// 文章结构表
export const ArticleParams = {
  TableName: "ARTICLE",
  KeySchema: [
    {
      AttributeName: "publishon",
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
      AttributeName: "publishon",
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
      AttributeName: "publishon",
      KeyType: "HASH",
    },
    {
      AttributeName: "id",
      KeyType: "RANGE",
    },
  ],
  AttributeDefinitions: [
    {
      AttributeName: "publishon",
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
      AttributeName: "email",
      KeyType: "RANGE",
    },
  ],
  AttributeDefinitions: [
    {
      AttributeName: "uid",
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
