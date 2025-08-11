import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface BasicInputsProps {
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  formData: {
    email: string;
    password: string;
  };
  updateFormData: (field: string, value: any) => void;
}

export const BasicInputs: React.FC<BasicInputsProps> = ({
  showPassword,
  togglePasswordVisibility,
  formData,
  updateFormData,
}) => {
  const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Input</CardTitle>
          <CardDescription>Standard text input with placeholder</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="basic">Basic Input</Label>
            <Input id="basic" placeholder="Enter text here..." />
          </div>
          <CodeBlock>
{`<Input 
  placeholder="Enter text here..." 
/>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input with Label</CardTitle>
          <CardDescription>Input with proper labeling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="labeled">Full Name</Label>
            <Input id="labeled" placeholder="John Doe" />
          </div>
          <CodeBlock>
{`<Label htmlFor="labeled">Full Name</Label>
<Input 
  id="labeled" 
  placeholder="John Doe" 
/>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Input</CardTitle>
          <CardDescription>Input with search icon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8" />
          </div>
          <CodeBlock>
{`<div className="relative">
  <Search className="absolute left-2 top-2.5 h-4 w-4" />
  <Input placeholder="Search..." className="pl-8" />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Input</CardTitle>
          <CardDescription>Email input with validation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="john@example.com"
                className="pl-8"
              />
            </div>
          </div>
          <CodeBlock>
{`<div className="relative">
  <Mail className="absolute left-2 top-2.5 h-4 w-4" />
  <Input 
    type="email" 
    placeholder="john@example.com" 
    className="pl-8" 
  />
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Input</CardTitle>
          <CardDescription>Password input with toggle visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                placeholder="Enter password"
                className="pl-8 pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <CodeBlock>
{`<div className="relative">
  <Lock className="absolute left-2 top-2.5 h-4 w-4" />
  <Input 
    type={showPassword ? "text" : "password"}
    className="pl-8 pr-10" 
  />
  <button onClick={togglePasswordVisibility}>
    {showPassword ? <EyeOff /> : <Eye />}
  </button>
</div>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disabled Input</CardTitle>
          <CardDescription>Disabled state input</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="disabled">Disabled Input</Label>
            <Input id="disabled" placeholder="Cannot edit this" disabled />
          </div>
          <CodeBlock>
{`<Input 
  placeholder="Cannot edit this" 
  disabled 
/>`}
          </CodeBlock>
        </CardContent>
      </Card>
    </div>
  );
};