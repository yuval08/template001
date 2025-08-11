import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  RefreshCw,
  Eye,
  Download
} from 'lucide-react';
import { formatFileSize } from '@/utils/formatters';

interface ReportControlsProps {
  pdfData: Blob | null;
  isLoading: boolean;
  onLoadSample: () => void;
  onDownload: () => void;
}

export const ReportControls: React.FC<ReportControlsProps> = ({
  pdfData,
  isLoading,
  onLoadSample,
  onDownload
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Load Report Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Sample Report
          </CardTitle>
          <CardDescription>
            Load a sample PDF report to demonstrate the viewer functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onLoadSample} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Load Sample Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Report Status */}
      <Card>
        <CardHeader>
          <CardTitle>Report Status</CardTitle>
          <CardDescription>Current report information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={pdfData ? "default" : "secondary"}>
              {pdfData ? "Loaded" : "No Report"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Size:</span>
            <span className="text-sm text-muted-foreground">
              {pdfData ? formatFileSize(pdfData.size) : "-"}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Type:</span>
            <span className="text-sm text-muted-foreground">
              {pdfData ? "PDF Document" : "-"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Download Control */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Download or share the current report</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onDownload} 
            disabled={!pdfData}
            variant="outline"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>PDF Viewer Instructions</CardTitle>
          <CardDescription>How to use the PDF viewer controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Navigation</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use arrow buttons to navigate pages</li>
                <li>• Click page numbers for quick navigation</li>
                <li>• Scroll within the viewer for long pages</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Viewing Options</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Zoom in/out with + and - buttons</li>
                <li>• Rotate pages with the rotate button</li>
                <li>• Toggle fullscreen for better viewing</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Actions</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Download the PDF file</li>
                <li>• View page and zoom information</li>
                <li>• Load different sample reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};