import { NextResponse } from 'next/server';
import { MongoClient, ObjectId, type MongoClientOptions } from 'mongodb';
import { type MongoDatabase, type MongoCollection } from '@/lib/types';

function getSimpleSchema(doc: Record<string, any>): string {
    if (!doc) {
        return '{}';
    }
    const schema: Record<string, any> = {};
    for (const key in doc) {
        if (Object.prototype.hasOwnProperty.call(doc, key)) {
            const value = doc[key];
            if (value === null) {
                schema[key] = 'null';
            } else if (value instanceof ObjectId) {
                schema[key] = 'objectId';
            } else if (Array.isArray(value)) {
                schema[key] = 'array';
            } else {
                schema[key] = typeof value;
            }
        }
    }
    return JSON.stringify(schema, null, 2);
}

// Helper to serialize documents, converting ObjectIds to strings.
function serializeDocs(docs: any[]): Record<string, any>[] {
    return docs.map(doc => {
        const newDoc: Record<string, any> = {};
        for (const key in doc) {
            if (Object.prototype.hasOwnProperty.call(doc, key)) {
                if (doc[key] instanceof ObjectId) {
                    newDoc[key] = doc[key].toString();
                } else {
                    newDoc[key] = doc[key];
                }
            }
        }
        return newDoc;
    });
}


export async function POST(request: Request) {
    const { connectionString } = await request.json();

    if (!connectionString) {
        return NextResponse.json({ error: 'Connection string is required' }, { status: 400 });
    }

    let client: MongoClient | null = null;

    try {
        const clientOptions: MongoClientOptions = {};
        // For non-SRV connection strings like localhost, directConnection is needed
        if (connectionString.startsWith('mongodb://') && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'))) {
             clientOptions.directConnection = true;
        }

        client = new MongoClient(connectionString, clientOptions);
        await client.connect();

        const dbList = await client.db().admin().listDatabases();
        const databases: MongoDatabase[] = [];
        
        const filteredDbs = dbList.databases.filter(db => !['admin', 'local', 'config'].includes(db.name));

        for (const dbInfo of filteredDbs) {
            const db = client.db(dbInfo.name);
            const collectionsList = await db.listCollections().toArray();
            
            const collections: MongoCollection[] = [];

            for (const colInfo of collectionsList) {
                if (colInfo.name.startsWith('system.')) {
                    continue;
                }
                const collection = db.collection(colInfo.name);
                const documents = await collection.find().limit(20).toArray();
                const serializableDocs = serializeDocs(documents);
                const schema = getSimpleSchema(documents[0]);

                collections.push({
                    name: colInfo.name,
                    schema: schema,
                    documents: serializableDocs,
                });
            }

            if (collections.length > 0) {
              databases.push({
                  name: dbInfo.name,
                  collections,
              });
            }
        }

        return NextResponse.json(databases);

    } catch (error) {
        console.error('MongoDB connection error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect to MongoDB';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    } finally {
        if (client) {
            await client.close();
        }
    }
}
