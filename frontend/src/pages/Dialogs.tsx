import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/stores/toastStore';
import { 
  Settings, 
  User, 
  LogOut, 
  Plus, 
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  Info,
  AlertTriangle,
  Copy,
  Archive,
  Share,
  Download,
  ChevronDown,
  Zap,
  Bell,
  Palette,
  Monitor
} from 'lucide-react';

const Dialogs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Form submitted!', `Hello ${formData.name}, your message has been sent.`);
    setFormData({ name: '', email: '', message: '' });
  };

  const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dialogs & Overlays Showcase
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Comprehensive examples of dialogs, modals, popovers, dropdown menus, and context menus using Shadcn/ui components.
        </p>
      </div>

      {/* Basic Dialogs */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Dialogs</CardTitle>
          <CardDescription>
            Standard dialogs for displaying content, forms, and user interactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Info Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About This Application</DialogTitle>
                  <DialogDescription>
                    This is a comprehensive showcase of UI components built with React, TypeScript, and Shadcn/ui. 
                    It demonstrates various patterns and best practices for modern web applications.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Version: 1.0.0<br />
                    Built with: React 18, TypeScript, Tailwind CSS<br />
                    Component Library: Shadcn/ui with Radix UI
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                  <Button onClick={() => toast.info('Thanks for reading!')}>
                    Got it
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Wide Dialog</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Wide Dialog Example</DialogTitle>
                  <DialogDescription>
                    This dialog has a custom width to accommodate more content.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• Custom width configuration</li>
                        <li>• Responsive design</li>
                        <li>• Keyboard navigation</li>
                        <li>• Focus management</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Use Cases</h4>
                      <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• Data tables</li>
                        <li>• Image galleries</li>
                        <li>• Complex forms</li>
                        <li>• Dashboard widgets</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Scrollable Dialog</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Terms and Conditions</DialogTitle>
                  <DialogDescription>
                    Please read these terms and conditions carefully.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 text-sm">
                  {Array.from({ length: 20 }, (_, i) => (
                    <p key={i} className="text-gray-600 dark:text-gray-400">
                      {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                      exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                  ))}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Decline</Button>
                  </DialogClose>
                  <Button onClick={() => toast.success('Terms accepted!')}>
                    Accept
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <CodeBlock>
{`<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description goes here.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Dialog content */}
    </div>
    <DialogFooter>
      <Button>Action</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Form Dialogs */}
      <Card>
        <CardHeader>
          <CardTitle>Form Dialogs</CardTitle>
          <CardDescription>
            Dialogs containing forms for user input and data collection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Enter the contact information below. All fields are required.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter a message..."
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Add Contact</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <CodeBlock>
{`<Dialog>
  <DialogTrigger asChild>
    <Button>Add New Contact</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add New Contact</DialogTitle>
      <DialogDescription>
        Enter the contact information below.
      </DialogDescription>
    </DialogHeader>
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Enter full name" />
      </div>
      {/* More form fields... */}
    </form>
  </DialogContent>
</Dialog>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Alert Dialogs */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Dialogs</CardTitle>
          <CardDescription>
            Confirmation dialogs for destructive or important actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Item
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the selected item
                    and remove all associated data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => toast.error('Item deleted!')}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign Out</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out? Any unsaved changes will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Stay Signed In</AlertDialogCancel>
                  <AlertDialogAction onClick={() => toast.info('Signed out successfully')}>
                    Sign Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <CodeBlock>
{`<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Item</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone...
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Popovers */}
      <Card>
        <CardHeader>
          <CardTitle>Popovers</CardTitle>
          <CardDescription>
            Lightweight overlays for displaying additional information or controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Info className="mr-2 h-4 w-4" />
                  Show Info
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-2">
                  <h4 className="font-medium">Quick Info</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This is a popover with additional information. It's perfect for 
                    showing contextual help or details without taking up too much space.
                  </p>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Quick Actions
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-2">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="grid gap-2">
                    <Button size="sm" className="justify-start" onClick={() => toast.success('Schedule created!')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Meeting
                    </Button>
                    <Button size="sm" variant="outline" className="justify-start" onClick={() => toast.info('Reminder set!')}>
                      <Bell className="mr-2 h-4 w-4" />
                      Set Reminder
                    </Button>
                    <Button size="sm" variant="ghost" className="justify-start" onClick={() => toast.info('Exported successfully!')}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Palette className="mr-2 h-4 w-4" />
                  Color Picker
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-3">
                  <h4 className="font-medium">Choose Color</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {['#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337', '#7f1d1d', 
                      '#ea580c', '#c2410c', '#9a3412', '#7c2d12', '#a16207', '#ca8a04', 
                      '#16a34a', '#15803d', '#166534', '#0f766e', '#0891b2', '#0369a1',
                      '#2563eb', '#1d4ed8', '#1e40af', '#6366f1', '#7c3aed', '#a855f7'].map(color => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                        style={{ backgroundColor: color }}
                        onClick={() => toast.info(`Selected color: ${color}`)}
                      />
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <CodeBlock>
{`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Show Info</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="space-y-2">
      <h4 className="font-medium">Quick Info</h4>
      <p className="text-sm text-muted-foreground">
        This is a popover with additional information.
      </p>
    </div>
  </PopoverContent>
</Popover>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Dropdown Menus */}
      <Card>
        <CardHeader>
          <CardTitle>Dropdown Menus</CardTitle>
          <CardDescription>
            Contextual menus triggered by buttons or other interactive elements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  User Menu
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info('Profile opened!')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Settings opened!')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info('Signed out!')}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => toast.info('Editing...')}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Copied!')}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Shared!')}>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.warning('Archived!')}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.error('Deleted!')}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CodeBlock>
{`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      User Menu
      <ChevronDown className="ml-2 h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <User className="mr-2 h-4 w-4" />
      Profile
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings className="mr-2 h-4 w-4" />
      Settings
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Context Menus */}
      <Card>
        <CardHeader>
          <CardTitle>Context Menus</CardTitle>
          <CardDescription>
            Right-click menus that provide contextual actions for specific elements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <ContextMenu>
              <ContextMenuTrigger className="flex h-40 w-full items-center justify-center rounded-md border border-dashed text-sm">
                Right-click here for context menu
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => toast.info('Opened!')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  Open
                </ContextMenuItem>
                <ContextMenuItem onClick={() => toast.info('Copied!')}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </ContextMenuItem>
                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem onClick={() => toast.info('Shared via email!')}>
                      Email
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => toast.info('Link copied!')}>
                      Copy Link
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => toast.info('Shared on social media!')}>
                      Social Media
                    </ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => toast.warning('Archived!')}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </ContextMenuItem>
                <ContextMenuItem onClick={() => toast.error('Deleted!')}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Try right-clicking on different elements throughout the application to see context menus in action.
            </div>
          </div>

          <CodeBlock>
{`<ContextMenu>
  <ContextMenuTrigger className="...">
    Right-click here for context menu
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>
      <Copy className="mr-2 h-4 w-4" />
      Copy
    </ContextMenuItem>
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <Share className="mr-2 h-4 w-4" />
        Share
      </ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>Email</ContextMenuItem>
        <ContextMenuItem>Copy Link</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  </ContextMenuContent>
</ContextMenu>`}
          </CodeBlock>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dialogs;