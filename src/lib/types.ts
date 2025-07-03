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
