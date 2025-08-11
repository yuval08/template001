import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuShortcut,
} from '@/components/ui/context-menu';
import { 
  Copy, 
  Cut, 
  Paste, 
  Undo, 
  Redo,
  Download,
  Share2,
  Bookmark,
  Edit,
  Trash,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/stores/toastStore';

export const ContextMenus: React.FC = () => {
  const handleContextAction = (action: string) => {
    toast.success({ title: `${action} clicked`, description: `Context menu action: ${action}` });
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
          <CardTitle>Basic Context Menu</CardTitle>
          <CardDescription>Right-click the area below to see the context menu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ContextMenu>
            <ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-md border border-dashed text-sm bg-muted/50 hover:bg-muted">
              Right click here
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
              <ContextMenuItem onClick={() => handleContextAction('Copy')}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
                <ContextMenuShortcut>⌘C</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextAction('Cut')}>
                <Cut className="mr-2 h-4 w-4" />
                Cut
                <ContextMenuShortcut>⌘X</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextAction('Paste')}>
                <Paste className="mr-2 h-4 w-4" />
                Paste
                <ContextMenuShortcut>⌘V</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => handleContextAction('Undo')}>
                <Undo className="mr-2 h-4 w-4" />
                Undo
                <ContextMenuShortcut>⌘Z</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextAction('Redo')}>
                <Redo className="mr-2 h-4 w-4" />
                Redo
                <ContextMenuShortcut>⌘⇧Z</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          <CodeBlock>
{`<ContextMenu>
  <ContextMenuTrigger className="...">
    Right click here
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>
      <Copy className="mr-2 h-4 w-4" />
      Copy
      <ContextMenuShortcut>⌘C</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem>
      <Paste className="mr-2 h-4 w-4" />
      Paste
      <ContextMenuShortcut>⌘V</ContextMenuShortcut>
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Context Menu</CardTitle>
          <CardDescription>Context menu with submenus and different item types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ContextMenu>
            <ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-md border border-dashed text-sm bg-muted/50 hover:bg-muted">
              Advanced menu (right click)
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
              <ContextMenuLabel>Actions</ContextMenuLabel>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => handleContextAction('Edit')}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextAction('Download')}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </ContextMenuItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem onClick={() => handleContextAction('Email')}>
                    Email Link
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleContextAction('Copy Link')}>
                    Copy Link
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleContextAction('Social')}>
                    Share to Social
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuItem onClick={() => handleContextAction('Bookmark')}>
                <Bookmark className="mr-2 h-4 w-4" />
                Bookmark
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuLabel>View Options</ContextMenuLabel>
              <ContextMenuCheckboxItem checked>
                <Eye className="mr-2 h-4 w-4" />
                Show Preview
              </ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem>
                <RefreshCw className="mr-2 h-4 w-4" />
                Auto Refresh
              </ContextMenuCheckboxItem>
              <ContextMenuSeparator />
              <ContextMenuItem 
                onClick={() => handleContextAction('Delete')}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          <CodeBlock>
{`<ContextMenu>
  <ContextMenuTrigger>Right click target</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuLabel>Actions</ContextMenuLabel>
    <ContextMenuSeparator />
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>Email Link</ContextMenuItem>
        <ContextMenuItem>Copy Link</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
    <ContextMenuSeparator />
    <ContextMenuCheckboxItem checked>
      Show Preview
    </ContextMenuCheckboxItem>
  </ContextMenuContent>
</ContextMenu>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Context Menu</CardTitle>
          <CardDescription>Simulated file browser context menu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ContextMenu>
            <ContextMenuTrigger className="flex h-20 w-full items-center justify-start px-4 rounded-md border bg-card text-card-foreground hover:bg-accent cursor-pointer">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  📄
                </div>
                <div>
                  <p className="font-medium">document.pdf</p>
                  <p className="text-sm text-muted-foreground">2.3 MB • Modified today</p>
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
              <ContextMenuItem onClick={() => handleContextAction('Open')}>
                <Eye className="mr-2 h-4 w-4" />
                Open
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextAction('Open With')}>
                Open with...
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => handleContextAction('Copy')}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
                <ContextMenuShortcut>⌘C</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextAction('Cut')}>
                <Cut className="mr-2 h-4 w-4" />
                Cut
                <ContextMenuShortcut>⌘X</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextAction('Rename')}>
                <Edit className="mr-2 h-4 w-4" />
                Rename
                <ContextMenuShortcut>F2</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuLabel>View</ContextMenuLabel>
              <ContextMenuRadioGroup value="list">
                <ContextMenuRadioItem value="grid">
                  Grid View
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="list">
                  List View
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="details">
                  Details View
                </ContextMenuRadioItem>
              </ContextMenuRadioGroup>
              <ContextMenuSeparator />
              <ContextMenuItem 
                onClick={() => handleContextAction('Delete')}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Move to Trash
                <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          <CodeBlock>
{`<ContextMenu>
  <ContextMenuTrigger className="file-item">
    <div className="flex items-center space-x-2">
      <div className="file-icon">📄</div>
      <div>
        <p>document.pdf</p>
        <p className="text-sm text-muted-foreground">
          2.3 MB • Modified today
        </p>
      </div>
    </div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Open</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuRadioGroup value="list">
      <ContextMenuRadioItem value="grid">
        Grid View
      </ContextMenuRadioItem>
      <ContextMenuRadioItem value="list">
        List View
      </ContextMenuRadioItem>
    </ContextMenuRadioGroup>
  </ContextMenuContent>
</ContextMenu>`}
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Text Selection Menu</CardTitle>
          <CardDescription>Context menu for text selection and editing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ContextMenu>
            <ContextMenuTrigger className="p-4 rounded border bg-muted/50 text-sm select-text cursor-text">
              This is some selectable text. You can select any part of this text and right-click to see the context menu with text-specific actions like copy, cut, and formatting options.
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
              <ContextMenuItem onClick={() => handleContextAction('Copy')}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
                <ContextMenuShortcut>⌘C</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextAction('Cut')}>
                <Cut className="mr-2 h-4 w-4" />
                Cut
                <ContextMenuShortcut>⌘X</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextAction('Paste')}>
                <Paste className="mr-2 h-4 w-4" />
                Paste
                <ContextMenuShortcut>⌘V</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  Format
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem onClick={() => handleContextAction('Bold')}>
                    Bold
                    <ContextMenuShortcut>⌘B</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleContextAction('Italic')}>
                    Italic
                    <ContextMenuShortcut>⌘I</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleContextAction('Underline')}>
                    Underline
                    <ContextMenuShortcut>⌘U</ContextMenuShortcut>
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuItem onClick={() => handleContextAction('Select All')}>
                Select All
                <ContextMenuShortcut>⌘A</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          <CodeBlock>
{`<ContextMenu>
  <ContextMenuTrigger className="selectable-text">
    This is some selectable text...
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuSub>
      <ContextMenuSubTrigger>Format</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>
          Bold
          <ContextMenuShortcut>⌘B</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Italic
          <ContextMenuShortcut>⌘I</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
    <ContextMenuItem>
      Select All
      <ContextMenuShortcut>⌘A</ContextMenuShortcut>
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`}
          </CodeBlock>
        </CardContent>
      </Card>
    </div>
  );
};