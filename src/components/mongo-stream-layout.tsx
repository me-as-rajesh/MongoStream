'use client';

import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { ConnectionBar } from '@/components/connection-bar';
import { DbBrowser } from '@/components/db-browser';
import { DataTable } from '@/components/data-table';
import { type MongoDatabase, type MongoCollection, DUMMY_DATABASES } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { HardDrive, ServerCrash } from 'lucide-react';

export function MongoStreamLayout() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [databases, setDatabases] = useState<MongoDatabase[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<MongoCollection | null>(null);

  const handleConnect = () => {
    setIsLoading(true);
    setSelectedCollection(null);
    setDatabases([]);
    setTimeout(() => {
      setDatabases(DUMMY_DATABASES);
      setIsConnected(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setDatabases([]);
    setSelectedCollection(null);
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
)
