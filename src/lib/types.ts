export interface MongoConnection {
  id: string;
  name: string;
  connectionString: string;
}

export interface MongoCollection {
  name: string;
  // A JSON string representation of the schema
  schema: string;
  // A list of documents, where each document is a record
  documents: Record<string, any>[];
}

export interface MongoDatabase {
  name: string;
  collections: MongoCollection[];
}

// DUMMY DATA
const usersCollection: MongoCollection = {
  name: 'users',
  schema: JSON.stringify({
    bsonType: "object",
    required: ["_id", "name", "email", "age", "address"],
    properties: {
      _id: { bsonType: "objectId" },
      name: { bsonType: "string", description: "must be a string and is required" },
      email: { bsonType: "string", pattern: "@mongodb.com$", description: "must be a string and match the regular expression pattern" },
      age: { bsonType: "int", minimum: 18, maximum: 99, description: "must be an integer in [ 18, 99 ] and is required" },
      address: {
        bsonType: "object",
        required: ["street", "city", "state"],
        properties: {
          street: { bsonType: "string" },
          city: { bsonType: "string" },
          state: { bsonType: "string" }
        }
      }
    }
  }, null, 2),
  documents: [
    { _id: '60d0fe4f5311236168a109cc', name: 'John Doe', email: 'john.doe@example.com', age: 34, address: { street: '123 Maple St', city: 'Anytown', state: 'CA' } },
    { _id: '60d0fe4f5311236168a109cd', name: 'Jane Smith', email: 'jane.smith@example.com', age: 28, address: { street: '456 Oak Ave', city: 'Someville', state: 'NY' } },
    { _id: '60d0fe4f5311236168a109ce', name: 'Peter Jones', email: 'peter.jones@example.com', age: 45, address: { street: '789 Pine Ln', city: 'Otherplace', state: 'TX' } },
    { _id: '60d0fe4f5311236168a109cf', name: 'Mary Johnson', email: 'mary.j@example.com', age: 22, address: { street: '101 Birch Rd', city: 'Anytown', state: 'CA' } },
  ]
};

const productsCollection: MongoCollection = {
    name: 'products',
    schema: JSON.stringify({
      bsonType: "object",
      required: ["_id", "name", "price", "in_stock"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        price: { bsonType: "double" },
        in_stock: { bsonType: "bool" }
      }
    }, null, 2),
    documents: [
      { _id: 'a1b2c3d4e5f6', name: 'Laptop', price: 1200.50, in_stock: true },
      { _id: 'a1b2c3d4e5f7', name: 'Mouse', price: 25.00, in_stock: true },
      { _id: 'a1b2c3d4e5f8', name: 'Keyboard', price: 75.99, in_stock: false },
      { _id: 'a1b2c3d4e5f9', name: 'Monitor', price: 300.00, in_stock: true },
    ]
};

export const DUMMY_DATABASES: MongoDatabase[] = [
  {
    name: 'e-commerce-db',
    collections: [usersCollection, productsCollection]
  },
  {
    name: 'analytics-db',
    collections: [
      {
        name: 'page_views',
        schema: JSON.stringify({ bsonType: 'object' }),
        documents: [
          { page: '/home', views: 1023 },
          { page: '/products', views: 874 },
        ]
      }
    ]
  }
];
