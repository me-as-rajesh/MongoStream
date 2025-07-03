'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { type MongoDatabase, type MongoCollection } from '@/lib/types';
import { Database, Table, CircleDashed } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DbBrowserProps {
  databases: MongoDatabase[];
  onSelectCollection: (collection: MongoCollection) => void;
  selectedCollection: MongoCollection | null;
  isConnected: boolean;
}

export function DbBrowser({ databases, onSelectCollection, selectedCollection, isConnected }: DbBrowserProps) {
  if (!isConnected) {
    return (
        <SidebarContent>
            <SidebarGroup>
                <div className="p-4 text-center text-sm text-muted-foreground">
                    <CircleDashed className="mx-auto mb-2 h-8 w-8" />
                    <p>Not connected to any database.</p>
                </div>
            </SidebarGroup>
        </SidebarContent>
    );
  }

  if (databases.length === 0) {
      return (
          <SidebarContent>
              <SidebarGroup>
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-8 w-full" />
              </SidebarGroup>
          </SidebarContent>
      )
  }

  return (
    <>
      <SidebarHeader>
        <p className="font-semibold text-lg">Databases</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Accordion type="multiple" className="w-full">
            {databases.map((db) => (
              <AccordionItem key={db.name} value={db.name}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-accent-foreground" />
                    <span>{db.name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <SidebarMenu>
                    {db.collections.map((collection) => (
                      <SidebarMenuItem key={collection.name}>
                        <SidebarMenuButton
                          onClick={() => onSelectCollection(collection)}
                          isActive={selectedCollection?.name === collection.name && selectedCollection === collection}
                          className="w-full justify-start"
                        >
                          <Table className="h-4 w-4" />
                          <span>{collection.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
