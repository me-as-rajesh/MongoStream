'use client';

import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { ConnectionBar } from '@/components/connection-bar';
import { DbBrowser } from '@/components/db-browser';
import { DataTable } from '@/components/data-table';
import { type MongoDatabase, type MongoCollection } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function MongoStreamLayout() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [databases, setDatabases] = useState<MongoDatabase[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<MongoCollection | null>(null);
  const [currentConnectionString, setCurrentConnectionString] = useState('');
  const { toast } = useToast();

  const fetchDatabaseInfo = async (connectionString: string) => {
    setIsLoading(true);
    setSelectedCollection(null);
    setDatabases([]);

    try {
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to connect to the database.');
      }

      const data: MongoDatabase[] = await response.json();
      setDatabases(data);
      setIsConnected(true);
      setCurrentConnectionString(connectionString);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setIsConnected(false);
      setDatabases([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = (connectionString: string) => {
    fetchDatabaseInfo(connectionString);
  };

  const handleRefresh = () => {
    if (currentConnectionString) {
      fetchDatabaseInfo(currentConnectionString);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setDatabases([]);
    setSelectedCollection(null);
    setCurrentConnectionString('');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <DbBrowser
          databases={databases}
          onSelectCollection={setSelectedCollection}
          selectedCollection={selectedCollection}
          isConnected={isConnected}
        />
      </Sidebar>
      <div className="flex flex-col min-h-screen w-full">
        <ConnectionBar
          isConnected={isConnected}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
        <SidebarInset>
          <main className="flex-1 p-4 lg:p-6">
            {isConnected ? (
              <DataTable collection={selectedCollection} />
            ) : (
              <WelcomeView />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

const WelcomeView = () => (
  <Card className="h-full flex items-center justify-center">
    <CardContent className="p-10 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-primary/10 p-4 rounded-full">
          <HardDrive className="w-10 h-10 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to MongoStream</h2>
      <p className="text-muted-foreground">
        Connect to your MongoDB database to get started.
      </p>
    </CardContent>
  </Card>
);
