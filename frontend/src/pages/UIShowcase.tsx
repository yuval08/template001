import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Terminal, 
  CheckCircle2, 
  Info,
  AlertTriangle,
  Download,
  Settings
} from 'lucide-react';
import { toast } from '@/stores/toastStore';

const UIShowcase: React.FC = () => {
  const [switchState, setSwitchState] = useState(false);
  const [checkboxState, setCheckboxState] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [progressValue, setProgressValue] = useState(66);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          UI Components Showcase
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          A comprehensive display of all available UI components in the system
        </p>
      </div>

      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Various button styles and states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Button Variants */}
              <div>
                <h3 className="text-sm font-medium mb-3">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              {/* Button Sizes */}
              <div>
                <h3 className="text-sm font-medium mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              {/* Button States */}
              <div>
                <h3 className="text-sm font-medium mb-3">States</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Active</Button>
                  <Button disabled>Disabled</Button>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    With Icon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Labels and status indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>
                <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>
                <Badge className="bg-blue-500 hover:bg-blue-600">Info</Badge>
                <Badge className="bg-purple-500 hover:bg-purple-600">Purple</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Controls</CardTitle>
              <CardDescription>Input fields and form elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Inputs */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-input">Text Input</Label>
                  <Input id="text-input" placeholder="Enter text..." />
                </div>
                
                <div>
                  <Label htmlFor="email-input">Email Input</Label>
                  <Input id="email-input" type="email" placeholder="email@example.com" />
                </div>

                <div>
                  <Label htmlFor="password-input">Password Input</Label>
                  <Input id="password-input" type="password" placeholder="Enter password..." />
                </div>

                <div>
                  <Label htmlFor="disabled-input">Disabled Input</Label>
                  <Input id="disabled-input" placeholder="Disabled" disabled />
                </div>

                <div>
                  <Label htmlFor="textarea">Textarea</Label>
                  <Textarea id="textarea" placeholder="Enter your message..." rows={4} />
                </div>
              </div>

              {/* Select */}
              <div>
                <Label htmlFor="select">Select</Label>
                <Select value={selectedValue} onValueChange={setSelectedValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Fruits</SelectLabel>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="banana">Banana</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Vegetables</SelectLabel>
                      <SelectItem value="carrot">Carrot</SelectItem>
                      <SelectItem value="potato">Potato</SelectItem>
                      <SelectItem value="tomato">Tomato</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Checkbox */}
              <div className="space-y-3">
                <Label>Checkboxes</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="checkbox1"
                    checked={checkboxState}
                    onCheckedChange={(checked) => setCheckboxState(checked === true)}
                  />
                  <Label htmlFor="checkbox1">Accept terms and conditions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="checkbox2" />
                  <Label htmlFor="checkbox2">Send me promotional emails</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="checkbox3" disabled />
                  <Label htmlFor="checkbox3">Disabled checkbox</Label>
                </div>
              </div>

              {/* Radio Group */}
              <div className="space-y-3">
                <Label>Radio Group</Label>
                <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="option1" />
                    <Label htmlFor="option1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="option2" />
                    <Label htmlFor="option2">Option 2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option3" id="option3" />
                    <Label htmlFor="option3">Option 3</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Switch */}
              <div className="space-y-3">
                <Label>Switches</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="switch1"
                    checked={switchState}
                    onCheckedChange={setSwitchState}
                  />
                  <Label htmlFor="switch1">Enable notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="switch2" />
                  <Label htmlFor="switch2">Dark mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="switch3" disabled />
                  <Label htmlFor="switch3">Disabled switch</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>Different alert styles for various purposes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Default Alert</AlertTitle>
                <AlertDescription>
                  This is a default alert with an icon and description.
                </AlertDescription>
              </Alert>

              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-200">Success!</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Your operation completed successfully.
                </AlertDescription>
              </Alert>

              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800 dark:text-yellow-200">Warning</AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  Please review this important information.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Something went wrong. Please try again later.
                </AlertDescription>
              </Alert>

              <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 dark:text-blue-200">Information</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  Here's some helpful information for you.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Indicators</CardTitle>
              <CardDescription>Loading and progress states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Progress Bar ({progressValue}%)</Label>
                <Progress value={progressValue} className="w-full" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>
                    -10%
                  </Button>
                  <Button size="sm" onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>
                    +10%
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Different Progress Values</Label>
                <Progress value={0} className="w-full" />
                <Progress value={25} className="w-full" />
                <Progress value={50} className="w-full" />
                <Progress value={75} className="w-full" />
                <Progress value={100} className="w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toasts</CardTitle>
              <CardDescription>Temporary notification messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => toast.success('Success message!')}>
                  Show Success Toast
                </Button>
                <Button variant="secondary" onClick={() => toast.info('Info message!')}>
                  Show Info Toast
                </Button>
                <Button variant="outline" onClick={() => toast.warning('Warning message!')}>
                  Show Warning Toast
                </Button>
                <Button variant="destructive" onClick={() => toast.error('Error message!')}>
                  Show Error Toast
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Avatars</CardTitle>
              <CardDescription>User profile images and fallbacks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                
                <Avatar>
                  <AvatarImage src="/broken-image.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>

                <Avatar>
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>

                <Avatar className="h-16 w-16">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>LG</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skeleton Loading</CardTitle>
              <CardDescription>Loading placeholders for content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>

              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-32 w-full rounded-lg" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dialogs</CardTitle>
              <CardDescription>Modal dialogs for user interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      setDialogOpen(false);
                      toast.success('Action confirmed!');
                    }}>
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cards</CardTitle>
              <CardDescription>Container components for grouping content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Card</CardTitle>
                    <CardDescription>A simple card with header and content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This is the card content area where you can place any content.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Card with Footer</CardTitle>
                    <CardDescription>Includes action buttons</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cards can also have footers for actions.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        With Icon
                      </div>
                    </CardTitle>
                    <CardDescription>Card with icon in title</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Badge>Active</Badge>
                      <span className="text-sm">Status indicator</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle>Highlighted Card</CardTitle>
                    <CardDescription>With primary border color</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This card has a colored border for emphasis.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
              <CardDescription>Tabbed navigation for organizing content</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tab 1 Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This is the content for the first tab.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tab2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tab 2 Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This is the content for the second tab.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tab3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tab 3 Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This is the content for the third tab.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UIShowcase;