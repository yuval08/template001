import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  User, 
  MapPin, 
  Calendar,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
  MoreHorizontal
} from 'lucide-react';

export const BasicCards: React.FC = () => {
  const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Simple Card</CardTitle>
          <CardDescription>Basic card with header and content</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is a simple card example with header, description, and content area.</p>
          <CodeBlock>
{`<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Card with Actions</CardTitle>
          <CardDescription>Card with buttons and interactive elements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This card includes action buttons and interactive elements.</p>
          <div className="flex gap-2">
            <Button size="sm">Primary</Button>
            <Button size="sm" variant="outline">Secondary</Button>
          </div>
          <CodeBlock>
{`<Card>
  <CardHeader>
    <CardTitle>Card with Actions</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex gap-2">
      <Button size="sm">Primary</Button>
      <Button size="sm" variant="outline">Secondary</Button>
    </div>
  </CardContent>
</Card>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">User Profile</CardTitle>
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/api/placeholder/40/40" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">Software Engineer</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="mr-1 h-3 w-3" />
              San Francisco
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              Joined 2023
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Article Title</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Published on March 15, 2024
          </p>
          <p className="text-sm mb-4">
            This is a preview of an article card with engagement metrics and actions.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Eye className="mr-1 h-3 w-3" />
                1.2k
              </div>
              <div className="flex items-center">
                <ThumbsUp className="mr-1 h-3 w-3" />
                89
              </div>
              <div className="flex items-center">
                <MessageSquare className="mr-1 h-3 w-3" />
                12
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};