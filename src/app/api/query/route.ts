
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId, type MongoClientOptions } from 'mongodb';

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
    const { connectionString, dbName, collectionName, query, limit = 100, skip = 0 } = await request.json();

    if (!connectionString || !dbName || !collectionName || query === undefined) {
        return NextResponse.json({ error: 'Missing required parameters: connectionString, dbName, collectionName, query' }, { status: 400 });
    }

    let client: MongoClient | null = null;

    try {
        const clientOptions: MongoClientOptions = {};
        if (connectionString.startsWith('mongodb://') && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'))) {
             clientOptions.directConnection = true;
        }

        client = new MongoClient(connectionString, clientOptions);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        let filter = {};
        if (query) {
            try {
                // The query from AI is a stringified JSON.
                filter = JSON.parse(query);
            } catch(e) {
                return NextResponse.json({ error: 'Invalid query format. Query must be a valid JSON string.' }, { status: 400 });
            }
        }

        const documents = await collection.find(filter).skip(Number(skip)).limit(Number(limit)).toArray();
        const serializableDocs = serializeDocs(documents);

        return NextResponse.json(serializableDocs);

    } catch (error) {
        console.error('Query execution error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during query execution.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    } finally {
        if (client) {
            await client.close();
        }
    }
}
