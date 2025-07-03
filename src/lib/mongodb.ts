import { MongoClient, type MongoClientOptions } from 'mongodb';

export function getMongoClient(connectionString: string): MongoClient {
    const clientOptions: MongoClientOptions = {};
    if (connectionString.startsWith('mongodb://') && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'))) {
        clientOptions.directConnection = true;
    }
    return new MongoClient(connectionString, clientOptions);
}
