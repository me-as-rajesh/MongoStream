import { NextResponse } from 'next/server';
import { MongoClient, ObjectId, type MongoClientOptions, type Db } from 'mongodb';
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

async function getCollectionsForDb(db: Db): Promise<MongoCollection[]> {
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
    return collections;
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

        const databases: MongoDatabase[] = [];

        let dbNameFromUri: string | undefined;
        try {
            // Temporarily replace protocol to allow standard URL parsing
            const parsedUrl = new URL(connectionString.replace('mongodb+srv', 'mongodb'));
            const path = parsedUrl.pathname;
            if (path && path.length > 1) { // Ensure path is not just "/"
                dbNameFromUri = path.substring(1).split('/')[0];
            }
        } catch (e) {
            console.warn('Could not parse database name from connection string', e);
        }

        if (dbNameFromUri) {
            // If a database is specified in the URI, only fetch its collections
            const db = client.db(dbNameFromUri);
            const collections = await getCollectionsForDb(db);
            if (collections.length > 0) {
                databases.push({
                    name: dbNameFromUri,
                    collections,
                });
            }
        } else {
            // Otherwise, list all databases the user has access to
            const dbList = await client.db().admin().listDatabases();
            const filteredDbs = dbList.databases.filter(db => !['admin', 'local', 'config'].includes(db.name));

            for (const dbInfo of filteredDbs) {
                const db = client.db(dbInfo.name);
                const collections = await getCollectionsForDb(db);
                if (collections.length > 0) {
                  databases.push({
                      name: dbInfo.name,
                      collections,
                  });
                }
            }
        }

        return NextResponse.json(databases);

    } catch (error) {
        console.error('MongoDB connection error:', error);
        let errorMessage = 'Failed to connect to MongoDB. Please check the connection string and your network access.';
        if (error instanceof Error) {
            if (error.message.includes('ECONNREFUSED')) {
                errorMessage = 'Connection refused. Please ensure your MongoDB server is running and accessible at the specified address and port.';
            } else if (error.message.includes('querySrv ENOTFOUND')) {
                errorMessage = 'Could not find the database host. Please check your connection string and DNS settings. For Atlas connections, ensure you are not behind a firewall that blocks the necessary ports.';
            } else if (error.message.includes('Authentication failed')) {
                errorMessage = 'Authentication failed. Please check your username and password.';
            } else {
                errorMessage = error.message;
            }
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    } finally {
        if (client) {
            await client.close();
        }
    }
}
