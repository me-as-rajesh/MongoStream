
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getMongoClient } from '@/lib/mongodb';

export async function POST(request: Request) {
    const { connectionString, dbName, collectionName, operation, payload } = await request.json();

    if (!connectionString || !dbName || !collectionName || !operation || !payload) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    let client: MongoClient | null = null;

    try {
        client = getMongoClient(connectionString);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        let result;

        switch (operation) {
            case 'insertOne':
                if (!payload.document) {
                    return NextResponse.json({ error: 'Missing document for insertOne operation' }, { status: 400 });
                }
                result = await collection.insertOne(payload.document);
                return NextResponse.json(result);

            case 'updateOne':
                if (!payload.id || !payload.document) {
                    return NextResponse.json({ error: 'Missing id or document for updateOne operation' }, { status: 400 });
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { _id, ...updateData } = payload.document;
                result = await collection.updateOne({ _id: new ObjectId(payload.id) }, { $set: updateData });
                return NextResponse.json(result);

            case 'deleteOne':
                if (!payload.id) {
                    return NextResponse.json({ error: 'Missing id for deleteOne operation' }, { status: 400 });
                }
                result = await collection.deleteOne({ _id: new ObjectId(payload.id) });
                return NextResponse.json(result);

            default:
                return NextResponse.json({ error: `Unsupported operation: ${operation}` }, { status: 400 });
        }

    } catch (error) {
        console.error('CRUD operation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during the CRUD operation.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    } finally {
        if (client) {
            await client.close();
        }
    }
}
