'use client';

import { useState } from 'react';
import { Table as TableIcon, BrainCircuit, BotMessageSquare, Sparkles, Loader2, FileJson } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type MongoCollection } from '@/lib/types';
import { aiDataFilter } from '@/ai/flows/ai-data-filter';
import { useToast } from '@/hooks/use-toast';

interface DataTableProps {
  collection: MongoCollection | null;
}

export function DataTable({ collection }: DataTableProps) {
  const [aiQuery, setAiQuery] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterResult, setFilterResult] = useState<{ mongoQuery: string, reasoning: string } | null>(null);
  const { toast } = useToast();

  const handleAiFilter = async () => {
    if (!collection) return;
    setIsFiltering(true);
    setFilterResult(null);
    try {
      const result = await aiDataFilter({
        naturalLanguageQuery: aiQuery,
        collectionName: collection.name,
        collectionSchema: collection.schema,
      });
      setFilterResult(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Filter Error",
        description: "Could not generate filter from your query.",
      });
    } finally {
      setIsFiltering(false);
    }
  };
  
  if (!collection) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="p-10 text-center">
          <div className="flex justify-center mb-4">
             <div className="bg-primary/10 p-4 rounded-full">
                <TableIcon className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">No Collection Selected</h2>
          <p className="text-muted-foreground">Select a collection from the browser to view its data.</p>
        </CardContent>
      </Card>
    );
  }

  const headers = collection.documents.length > 0 ? Object.keys(collection.documents[0]) : [];

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="text-primary" />
                AI Data Filtering
              </CardTitle>
              <CardDescription>Use natural language to filter data in the '{collection.name}' collection.</CardDescription>
            </div>
            <Button onClick={handleAiFilter} disabled={isFiltering || !aiQuery}>
              {isFiltering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Apply Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            placeholder={`e.g., "Find all users older than 30 in California"`}
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiFilter()}
          />
        </CardContent>
      </Card>

      {filterResult && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BotMessageSquare className="text-primary"/>
                    AI Generated Query
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold mb-2">Mongo Query:</h4>
                    <pre className="bg-muted p-3 rounded-md font-code text-sm overflow-x-auto">
                      <code>{filterResult.mongoQuery}</code>
                    </pre>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Reasoning:</h4>
                    <p className="text-sm text-muted-foreground">{filterResult.reasoning}</p>
                </div>
            </CardContent>
        </Card>
      )}

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="text-primary" />
            Collection: <Badge variant="secondary">{collection.name}</Badge>
          </CardTitle>
          <CardDescription>
            Showing {collection.documents.length} documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  {headers.map((header) => <TableHead key={header}>{header}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {collection.documents.map((doc, index) => (
                  <TableRow key={index}>
                    {headers.map((header) => (
                      <TableCell key={header}>
                        {typeof doc[header] === 'object' && doc[header] !== null
                          ? <pre className="font-code text-xs">{JSON.stringify(doc[header])}</pre>
                          : String(doc[header])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
