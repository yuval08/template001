import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar,
  Clock,
  Phone,
  CreditCard,
  MapPin,
  Globe,
  Palette
} from 'lucide-react';

export const AdvancedInputs: React.FC = () => {
  const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Date Input</CardTitle>
          <CardDescription>Date picker input</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                className="pl-8"
              />
            </div>
          </div>
          <CodeBlock>
{`<div className="relative">
  <Calendar className="absolute left-2 top-2.5 h-4 w-4" />
  <Input type="date" className="pl-8" />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Input</CardTitle>
          <CardDescription>Time picker input</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <div className="relative">
              <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="time"
                type="time"
                className="pl-8"
              />
            </div>
          </div>
          <CodeBlock>
{`<div className="relative">
  <Clock className="absolute left-2 top-2.5 h-4 w-4" />
  <Input type="time" className="pl-8" />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phone Input</CardTitle>
          <CardDescription>Telephone number input</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="pl-8"
              />
            </div>
          </div>
          <CodeBlock>
{`<div className="relative">
  <Phone className="absolute left-2 top-2.5 h-4 w-4" />
  <Input 
    type="tel" 
    placeholder="+1 (555) 123-4567" 
    className="pl-8" 
  />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credit Card Input</CardTitle>
          <CardDescription>Credit card number input with formatting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="credit-card">Credit Card</Label>
            <div className="relative">
              <CreditCard className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="credit-card"
                placeholder="1234 5678 9012 3456"
                className="pl-8"
              />
            </div>
          </div>
          <CodeBlock>
{`<div className="relative">
  <CreditCard className="absolute left-2 top-2.5 h-4 w-4" />
  <Input 
    placeholder="1234 5678 9012 3456" 
    className="pl-8" 
  />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address Input</CardTitle>
          <CardDescription>Location/address input</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                placeholder="123 Main St, City, State 12345"
                className="pl-8"
              />
            </div>
          </div>
          <CodeBlock>
{`<div className="relative">
  <MapPin className="absolute left-2 top-2.5 h-4 w-4" />
  <Input 
    placeholder="123 Main St, City, State 12345" 
    className="pl-8" 
  />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>URL Input</CardTitle>
          <CardDescription>Website URL input</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <div className="relative">
              <Globe className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                className="pl-8"
              />
            </div>
          </div>
          <CodeBlock>
{`<div className="relative">
  <Globe className="absolute left-2 top-2.5 h-4 w-4" />
  <Input 
    type="url" 
    placeholder="https://example.com" 
    className="pl-8" 
  />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Color Input</CardTitle>
          <CardDescription>Color picker input</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Palette className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="color"
                  placeholder="#2563eb"
                  className="pl-8"
                />
              </div>
              <Input
                type="color"
                defaultValue="#2563eb"
                className="w-12 h-10 p-1"
              />
            </div>
          </div>
          <CodeBlock>
{`<div className="flex gap-2">
  <div className="relative flex-1">
    <Palette className="absolute left-2 top-2.5 h-4 w-4" />
    <Input placeholder="#2563eb" className="pl-8" />
  </div>
  <Input 
    type="color" 
    defaultValue="#2563eb" 
    className="w-12 h-10 p-1" 
  />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Number Input</CardTitle>
          <CardDescription>Numeric input with min/max</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="number">Quantity</Label>
            <Input
              id="number"
              type="number"
              min="0"
              max="100"
              defaultValue="1"
              placeholder="Enter quantity"
            />
          </div>
          <CodeBlock>
{`<Input 
  type="number" 
  min="0" 
  max="100" 
  defaultValue="1"
  placeholder="Enter quantity" 
/>`}
          </CodeBlock>
        </CardContent>
      </Card>
    </div>
  );
};