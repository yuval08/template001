import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Zap,
  Mail
} from 'lucide-react';

export const BadgeShowcase: React.FC = () => {
  const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Badge Variants</CardTitle>
          <CardDescription>Different badge styles and variants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-500">Custom Blue</Badge>
              <Badge className="bg-green-500">Custom Green</Badge>
              <Badge className="bg-purple-500">Custom Purple</Badge>
              <Badge className="bg-orange-500">Custom Orange</Badge>
            </div>
          </div>

          <CodeBlock>
{`<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>

{/* Custom colors */}
<Badge className="bg-blue-500">Custom Blue</Badge>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Badges</CardTitle>
          <CardDescription>Badges for different status indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Success
              </Badge>
              <span className="text-sm text-muted-foreground">Operation completed</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                <AlertCircle className="w-3 h-3 mr-1" />
                Warning
              </Badge>
              <span className="text-sm text-muted-foreground">Needs attention</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-red-600 border-red-600">
                <XCircle className="w-3 h-3 mr-1" />
                Error
              </Badge>
              <span className="text-sm text-muted-foreground">Failed operation</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </Badge>
              <span className="text-sm text-muted-foreground">In progress</span>
            </div>
          </div>

          <CodeBlock>
{`<Badge variant="outline" className="text-green-600 border-green-600">
  <CheckCircle className="w-3 h-3 mr-1" />
  Success
</Badge>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interactive Badges</CardTitle>
          <CardDescription>Clickable badges with actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Badge variant="secondary" className="mr-1">3</Badge>
              Notifications
            </Button>
            
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Mail className="w-3 h-3 mr-1" />
              <Badge variant="destructive" className="ml-1 text-xs">5</Badge>
            </Button>
            
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Zap className="w-3 h-3 mr-1" />
              Pro
              <Badge className="ml-1 bg-yellow-500 text-black text-xs">NEW</Badge>
            </Button>
          </div>

          <CodeBlock>
{`<Button variant="ghost" size="sm">
  <Badge variant="secondary" className="mr-1">3</Badge>
  Notifications
</Button>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badge Sizes</CardTitle>
          <CardDescription>Different badge sizes and text variations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="text-xs px-1.5 py-0.5">Extra Small</Badge>
              <Badge className="text-xs">Small</Badge>
              <Badge>Default</Badge>
              <Badge className="text-sm px-3 py-1">Large</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full">
                Pill Shape
              </Badge>
              <Badge className="rounded">
                Rounded
              </Badge>
              <Badge className="rounded-none">
                Square
              </Badge>
            </div>
          </div>

          <CodeBlock>
{`{/* Different sizes */}
<Badge className="text-xs px-1.5 py-0.5">Extra Small</Badge>
<Badge className="text-sm px-3 py-1">Large</Badge>

{/* Different shapes */}
<Badge className="rounded-full">Pill Shape</Badge>
<Badge className="rounded-none">Square</Badge>`}
          </CodeBlock>
        </CardContent>
      </Card>
    </div>
  );
};