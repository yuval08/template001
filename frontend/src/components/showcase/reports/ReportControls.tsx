import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('dashboard');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Load Report Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {t('reports.controls.sample_report')}
          </CardTitle>
          <CardDescription>
            {t('reports.controls.sample_report_description')}
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
                {t('reports.controls.loading')}
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                {t('reports.controls.load_sample_report')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Report Status */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.controls.report_status')}</CardTitle>
          <CardDescription>{t('reports.controls.report_status_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('reports.labels.status')}</span>
            <Badge variant={pdfData ? "default" : "secondary"}>
              {pdfData ? t('reports.status.loaded') : t('reports.status.no_report')}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('reports.labels.size')}</span>
            <span className="text-sm text-muted-foreground">
              {pdfData ? formatFileSize(pdfData.size) : "-"}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('reports.labels.type')}</span>
            <span className="text-sm text-muted-foreground">
              {pdfData ? t('reports.status.pdf_document') : "-"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Download Control */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.controls.export_options')}</CardTitle>
          <CardDescription>{t('reports.controls.export_options_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onDownload} 
            disabled={!pdfData}
            variant="outline"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('reports.controls.download_pdf')}
          </Button>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>{t('reports.instructions.title')}</CardTitle>
          <CardDescription>{t('reports.instructions.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">{t('reports.instructions.navigation.title')}</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {t('reports.instructions.navigation.arrow_buttons')}</li>
                <li>• {t('reports.instructions.navigation.page_numbers')}</li>
                <li>• {t('reports.instructions.navigation.scroll')}</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">{t('reports.instructions.viewing_options.title')}</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {t('reports.instructions.viewing_options.zoom')}</li>
                <li>• {t('reports.instructions.viewing_options.rotate')}</li>
                <li>• {t('reports.instructions.viewing_options.fullscreen')}</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">{t('reports.instructions.actions.title')}</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {t('reports.instructions.actions.download')}</li>
                <li>• {t('reports.instructions.actions.view_info')}</li>
                <li>• {t('reports.instructions.actions.load_reports')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};