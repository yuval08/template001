import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2,
  Download,
  RefreshCw,
  Heart,
  Bookmark,
  Share2
} from 'lucide-react';
import { toast } from '@/stores/toastStore';

interface InteractiveCardsProps {
  isLoading: boolean;
  progress: number;
}

export const InteractiveCards: React.FC<InteractiveCardsProps> = ({ isLoading, progress }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success({ title: isLiked ? 'Unliked' : 'Liked', description: 'Thank you for your feedback!' });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success({ title: isBookmarked ? 'Removed from bookmarks' : 'Bookmarked' });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success({ title: 'Link copied', description: 'Shared link copied to clipboard' });
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          toast.success({ title: 'Download completed', description: 'File downloaded successfully' });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Loading States</CardTitle>
          <CardDescription>Cards with loading skeletons and states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          ) : (
            <div className="space-y-2">
              <p>Content has finished loading!</p>
              <p>This demonstrates loading states with skeleton placeholders.</p>
              <Badge variant="secondary">Loaded</Badge>
            </div>
          )}

          <CodeBlock>
{`{isLoading ? (
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
) : (
  <div>Content loaded!</div>
)}`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interactive Elements</CardTitle>
          <CardDescription>Cards with interactive buttons and state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant={isLiked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              className={isLiked ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
              {isLiked ? "Liked" : "Like"}
            </Button>
            
            <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={handleBookmark}
            >
              <Bookmark className={`h-4 w-4 mr-1 ${isBookmarked ? "fill-current" : ""}`} />
              {isBookmarked ? "Saved" : "Save"}
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>

          <CodeBlock>
{`const [isLiked, setIsLiked] = useState(false);

<Button
  variant={isLiked ? "default" : "outline"}
  onClick={() => setIsLiked(!isLiked)}
>
  <Heart className={isLiked ? "fill-current" : ""} />
  {isLiked ? "Liked" : "Like"}
</Button>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress Tracking</CardTitle>
          <CardDescription>Cards showing progress and completion states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Upload Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progress === 100 ? "Upload completed!" : "Uploading files..."}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Download Progress</span>
              <span>{downloadProgress}%</span>
            </div>
            <Progress value={downloadProgress} className="h-2" />
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Start Download
                </>
              )}
            </Button>
          </div>

          <CodeBlock>
{`<Progress value={progress} className="h-2" />

<Button disabled={isLoading}>
  {isLoading ? (
    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
  ) : (
    <Download className="h-4 w-4 mr-2" />
  )}
  {isLoading ? "Processing..." : "Download"}
</Button>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action Cards</CardTitle>
          <CardDescription>Cards designed for user actions and feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Ready to get started?</h3>
              <p className="text-sm text-muted-foreground">
                Click the button below to begin your journey.
              </p>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button onClick={() => toast.success({ title: "Welcome!", description: "Getting started..." })}>
                Get Started
              </Button>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Need help? Contact our support team.
              </p>
            </div>
          </div>

          <CodeBlock>
{`<Card>
  <CardContent className="text-center space-y-4">
    <h3>Ready to get started?</h3>
    <Button onClick={handleAction}>
      Get Started
    </Button>
  </CardContent>
</Card>`}
          </CodeBlock>
        </CardContent>
      </Card>
    </div>
  );
};