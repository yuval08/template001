import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFViewer } from '@/components/showcase/reports/PDFViewer';
import { ReportControls } from '@/components/showcase/reports/ReportControls';
import { useSampleReport } from '@/entities/report';
import { toast } from '@/stores/toastStore';
import { PageLayout } from '@/components/common';

const Reports: React.FC = () => {
  const { t } = useTranslation('dashboard');
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
      toast.success({ title: 'Report loaded successfully' });
    } catch (error) {
      toast.error({ title: 'Failed to load report' });
    }
  };

  const downloadReport = () => {
    if (!pdfData) return;

    const url = URL.createObjectURL(pdfData);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success({ title: 'Download started', description: 'PDF file is being downloaded' });
  };

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
    setPageNumber(1);
  };

  const changePage = (page: number) => {
    setPageNumber(page);
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  const rotate = () => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <PageLayout
      title={t('reports.title')}
      description={t('reports.subtitle')}
      maxWidth="6xl"
    >

      {/* Report Controls */}
      <ReportControls
        pdfData={pdfData}
        isLoading={sampleReportMutation.isPending}
        onLoadSample={loadSampleReport}
        onDownload={downloadReport}
      />

      {/* PDF Viewer */}
      <PDFViewer
        pdfData={pdfData}
        numPages={numPages}
        pageNumber={pageNumber}
        scale={scale}
        rotation={rotation}
        isFullscreen={isFullscreen}
        onLoadSuccess={onDocumentLoadSuccess}
        onPageChange={changePage}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onRotate={rotate}
        onToggleFullscreen={toggleFullscreen}
        onDownload={downloadReport}
      />
    </PageLayout>
  );
};

export default Reports;