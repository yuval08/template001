import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSampleReport } from '@/hooks/useApi';
import { 
  Download, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  RefreshCw,
  Eye
} from 'lucide-react';
import { toast } from '@/stores/toastStore';
import { formatFileSize } from '@/utils/formatters';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const Reports: React.FC = () => {
  const [pdfData, setPdfData] = useState<Blob | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const sampleReportMutation = useSampleReport();

  const loadSampleReport = async () => {
    try {
      const blob = await sampleReportMutation.mutateAsync();
      setPdfData(blob);
      setPageNumber(1);
      setScale(1.0);
      setRotation(0);
      toast.success('Report loaded successfully');
    } catch (error) {
      toast.error('Failed to load report');
    }
  };

  const downloadReport = () => {
    if (!pdfData) return;

    const url = window.URL.createObjectURL(pdfData);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample-report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Report downloaded');
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    toast.error('Error loading PDF document');
  };

  const changePage = (delta: number) => {
    const newPage = pageNumber + delta;
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
    }
  };

  const changeScale = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(3.0, scale + delta));
    setScale(newScale);
  };

  const rotateDocument = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetView = () => {
    setScale(1.0);
    setRotation(0);
    setPageNumber(1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Mock report metadata
  const reportMetadata = {
    title: 'Monthly Project Summary Report',
    description: 'Comprehensive overview of project status, team performance, and key metrics',
    generated: new Date().toISOString(),
    size: pdfData ? formatFileSize(pdfData.size) : 'N/A',
    pages: numPages,
    format: 'PDF',
  };

  const availableReports = [
    {
      id: 'monthly-summary',
      title: 'Monthly Project Summary',
      description: 'Overview of all projects with status updates and key metrics',
      lastGenerated: '2024-01-15',
      size: '2.3 MB',
      type: 'pdf',
    },
    {
      id: 'user-activity',
      title: 'User Activity Report',
      description: 'Detailed analysis of user engagement and activity patterns',
      lastGenerated: '2024-01-14',
      size: '1.8 MB',
      type: 'pdf',
    },
    {
      id: 'financial-summary',
      title: 'Financial Summary',
      description: 'Budget analysis and financial performance metrics',
      lastGenerated: '2024-01-13',
      size: '1.2 MB',
      type: 'pdf',
    },
    {
      id: 'performance-metrics',
      title: 'Performance Metrics',
      description: 'System performance and usage statistics',
      lastGenerated: '2024-01-12',
      size: '900 KB',
      type: 'pdf',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Reports
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Generate, view, and download various reports with PDF preview functionality.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Reports */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>
                Select a report to preview or download
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-red-500" />
                        <h4 className="font-medium text-sm">{report.title}</h4>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {report.description}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Last: {report.lastGenerated}</span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={loadSampleReport}
                      disabled={sampleReportMutation.isPending}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadReport}
                      disabled={!pdfData}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Generate New Report */}
              <div className="pt-4 border-t">
                <Button
                  onClick={loadSampleReport}
                  disabled={sampleReportMutation.isPending}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${sampleReportMutation.isPending ? 'animate-spin' : ''}`} />
                  Generate Sample Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Metadata */}
          {pdfData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Report Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium">Title</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {reportMetadata.title}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Description</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {reportMetadata.description}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Pages</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {reportMetadata.pages}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Size</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {reportMetadata.size}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Format</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {reportMetadata.format}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* PDF Preview */}
        <div className="lg:col-span-2">
          <Card className={isFullscreen ? 'fixed inset-4 z-50' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>PDF Preview</CardTitle>
                  <CardDescription>
                    {pdfData ? `Page ${pageNumber} of ${numPages}` : 'No document loaded'}
                  </CardDescription>
                </div>
                {pdfData && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(-1)}
                      disabled={pageNumber <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm px-2">
                      {pageNumber} / {numPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(1)}
                      disabled={pageNumber >= numPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!pdfData ? (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <FileText className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                    No Report Loaded
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Select a report from the sidebar to preview it here
                  </p>
                  <Button
                    onClick={loadSampleReport}
                    disabled={sampleReportMutation.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${sampleReportMutation.isPending ? 'animate-spin' : ''}`} />
                    Load Sample Report
                  </Button>
                </div>
              ) : (
                <>
                  {/* PDF Controls */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changeScale(-0.1)}
                        disabled={scale <= 0.5}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm px-2 min-w-[60px] text-center">
                        {Math.round(scale * 100)}%
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changeScale(0.1)}
                        disabled={scale >= 3.0}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={rotateDocument}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetView}
                      >
                        Reset
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleFullscreen}
                      >
                        {isFullscreen ? (
                          <Minimize className="h-4 w-4" />
                        ) : (
                          <Maximize className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={downloadReport}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* PDF Document */}
                  <div className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[600px]'} overflow-auto border rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
                    <Document
                      file={pdfData}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-2">Loading PDF...</span>
                        </div>
                      }
                      error={
                        <div className="flex items-center justify-center p-8 text-red-500">
                          <FileText className="h-8 w-8 mr-2" />
                          <span>Error loading PDF document</span>
                        </div>
                      }
                    >
                      <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        rotate={rotation}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading={
                          <div className="flex items-center justify-center p-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          </div>
                        }
                      />
                    </Document>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;