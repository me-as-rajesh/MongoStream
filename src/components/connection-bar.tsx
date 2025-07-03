'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type MongoConnection } from '@/lib/types';
import { Plug, Unplug, Plus, Trash2, Save, Loader2, Database, RefreshCw } from 'lucide-react';

interface ConnectionBarProps {
  isConnected: boolean;
  isLoading: boolean;
  onConnect: (connectionString: string) => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}

export function ConnectionBar({ isConnected, isLoading, onConnect, onDisconnect, onRefresh }: ConnectionBarProps) {
  const [connections, setConnections] = useLocalStorage<MongoConnection[]>('mongo-connections', []);
  const [connectionString, setConnectionString] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  const handleSelectConnection = (id: string) => {
    const conn = connections.find(c => c.id === id);
    if (conn) {
      setConnectionString(conn.connectionString);
      setSelectedConnectionId(id);
    }
  };

  const handleSaveConnection = () => {
    if (saveName && connectionString) {
      const newConnection: MongoConnection = {
        id: crypto.randomUUID(),
        name: saveName,
        connectionString,
      };
      const updatedConnections = [...connections, newConnection];
      setConnections(updatedConnections);
      setSelectedConnectionId(newConnection.id);
      setSaveName('');
      setIsSaveDialogOpen(false);
    }
  };

  const handleDeleteConnection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConnections(connections.filter(c => c.id !== id));
    if (selectedConnectionId === id) {
        setSelectedConnectionId(null);
        setConnectionString('');
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
        <Database className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-bold">MongoStream</h1>
      </div>
      <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
            <div className="flex w-full max-w-lg items-center space-x-2">
                <Select onValueChange={handleSelectConnection} value={selectedConnectionId || ''}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Saved Connections" />
                    </SelectTrigger>
                    <SelectContent>
                        {connections.map(conn => (
                            <SelectItem key={conn.id} value={conn.id} className="group">
                                <span className="flex items-center justify-between w-full">
                                {conn.name}
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => handleDeleteConnection(e, conn.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="text"
                    placeholder="mongodb://... or mongodb+srv://..."
                    value={connectionString}
                    onChange={(e) => setConnectionString(e.target.value)}
                    className="font-code"
                    disabled={isLoading || isConnected}
                />
                <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" disabled={!connectionString || isLoading}>
                            <Save className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Save Connection</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" value={saveName} onChange={(e) => setSaveName(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSaveConnection}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {isConnected ? (
                    <div className="flex items-center gap-2">
                        <Button onClick={onRefresh} variant="outline" size="icon" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        </Button>
                        <Button onClick={onDisconnect} variant="destructive" className="w-[120px]">
                            <Unplug className="mr-2 h-4 w-4" /> Disconnect
                        </Button>
                    </div>
                ) : (
                    <Button onClick={() => onConnect(connectionString)} disabled={!connectionString || isLoading} className="w-[120px]">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plug className="mr-2 h-4 w-4" />}
                        Connect
                    </Button>
                )}
            </div>
        </div>
      </div>
    </header>
  );
}
