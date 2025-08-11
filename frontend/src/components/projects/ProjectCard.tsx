import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/entities/project';
import { formatDate } from '@/utils/formatters';
import { 
  Calendar,
  CalendarX,
  Clock,
  Edit,
  Trash2,
  FileText,
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      active: { text: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
      completed: { text: 'Completed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
      paused: { text: 'Paused', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' }
    };
    return configs[status as keyof typeof configs] || { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  };

  const statusConfig = getStatusConfig(project.status);

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* Header with title and status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                {project.name}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${statusConfig.color}`}>
                {statusConfig.text}
              </span>
            </div>
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(project)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(project)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {project.description}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Start:</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(project.startDate)}
              </span>
            </div>
            
            {project.endDate && (
              <div className="flex items-center gap-2 text-sm">
                <CalendarX className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">End:</span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(project.endDate)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Created:</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(project.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};