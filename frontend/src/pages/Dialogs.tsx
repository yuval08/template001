import React from 'react';
import { BasicDialogs } from '@/components/showcase/dialogs/BasicDialogs';
import { PopoverMenus } from '@/components/showcase/dialogs/PopoverMenus';
import { ContextMenus } from '@/components/showcase/dialogs/ContextMenus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dialogs: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dialogs & Overlays Showcase
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Comprehensive examples of dialogs, popovers, dropdowns, and context menus using Shadcn/ui components.
        </p>
      </div>

      <Tabs defaultValue="dialogs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dialogs">Dialogs</TabsTrigger>
          <TabsTrigger value="menus">Menus & Popovers</TabsTrigger>
          <TabsTrigger value="context">Context Menus</TabsTrigger>
        </TabsList>

        <TabsContent value="dialogs" className="mt-6">
          <BasicDialogs />
        </TabsContent>

        <TabsContent value="menus" className="mt-6">
          <PopoverMenus />
        </TabsContent>

        <TabsContent value="context" className="mt-6">
          <ContextMenus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dialogs;