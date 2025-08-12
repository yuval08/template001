import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Download
} from 'lucide-react';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfData: Blob | null;
  numPages: number;
  pageNumber: number;
  scale: number;
  rotation: number;
  isFullscreen: boolean;
  onLoadSuccess: (pdf: { numPages: number }) => void;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onToggleFullscreen: () => void;
  onDownload: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfData,
  numPages,
  pageNumber,
  scale,
  rotation,
  isFullscreen,
  onLoadSuccess,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onRotate,
  onToggleFullscreen,
  onDownload
}) => {
  const { t } = useTranslation('dashboard');
  if (!pdfData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.pdf_viewer')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">{t('reports.no_pdf_loaded')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{t('reports.pdf_viewer')}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {t('reports.page_of', { current: pageNumber, total: numPages })}
            </Badge>
            <Badge variant="outline">
              {Math.round(scale * 100)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* PDF Controls */}
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm">
              {t('reports.page_of', { current: pageNumber, total: numPages })}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={onZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={onRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={onToggleFullscreen}>
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
            
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Document */}
        <div className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'max-h-96'} overflow-auto border rounded`}>
          <div className="flex justify-center p-4">
            <Document
              file={pdfData}
              onLoadSuccess={onLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-64 text-red-500">
                  {t('reports.failed_to_load_pdf')}
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                loading={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                }
              />
            </Document>
          </div>
        </div>

        {/* Page Navigation */}
        {numPages > 1 && (
          <div className="flex justify-center mt-4 space-x-1">
            {Array.from({ length: Math.min(10, numPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={page === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="w-10 h-8"
                >
                  {page}
                </Button>
              );
            })}
            {numPages > 10 && (
              <>
                <span className="px-2 py-1 text-sm">...</span>
                <Button
                  variant={numPages === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(numPages)}
                  className="w-10 h-8"
                >
                  {numPages}
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};