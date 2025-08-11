import React, { useState, useEffect } from 'react';
import { BasicCards } from '@/components/showcase/cards/BasicCards';
import { StatCards } from '@/components/showcase/cards/StatCards';
import { BadgeShowcase } from '@/components/showcase/cards/BadgeShowcase';
import { InteractiveCards } from '@/components/showcase/cards/InteractiveCards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const CardsAndBadges: React.FC = () => {
  const [progress, setProgress] = useState(13);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Animate progress
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  const resetDemo = () => {
    setIsLoading(true);
    setProgress(13);
    
    setTimeout(() => setIsLoading(false), 2000);
    setTimeout(() => setProgress(66), 500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Cards & Badges Showcase
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Comprehensive examples of card layouts, stat displays, badges, and interactive elements.
          </p>
        </div>
        <Button onClick={resetDemo} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset Demo
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Cards</TabsTrigger>
          <TabsTrigger value="stats">Stat Cards</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="interactive">Interactive</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <BasicCards />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <StatCards progress={progress} />
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <BadgeShowcase />
        </TabsContent>

        <TabsContent value="interactive" className="mt-6">
          <InteractiveCards isLoading={isLoading} progress={progress} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CardsAndBadges;