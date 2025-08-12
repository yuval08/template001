import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PendingInvitation, getUserRoleLabel, getUserRoleBadgeColor } from '@/types/user';
import { formatRelativeTime } from '@/utils/formatters';
import { Mail, Clock, User, X } from 'lucide-react';

interface InvitationTableProps {
  invitations: PendingInvitation[];
  totalCount: number;
  loading: boolean;
  error?: Error | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const InvitationTable: React.FC<InvitationTableProps> = ({
  invitations,
  totalCount,
  loading,
  error,
  onLoadMore,
  hasMore,
}) => {
  const { t } = useTranslation('users');
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <p className="text-red-500">{t('invitations.error_loading', { message: error.message })}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {t('invitations.title')}
        </CardTitle>
        <CardDescription>
          {t('invitations.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && invitations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">{t('common:messages.loading')}</span>
            </div>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('invitations.no_pending')}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {t('invitations.get_started')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => {
              const isExpired = new Date(invitation.expiresAt) < new Date();
              const isUsed = invitation.isUsed;
              
              return (
                <div
                  key={invitation.id}
                  className={`p-4 border rounded-lg ${
                    isExpired || isUsed
                      ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isExpired || isUsed
                              ? 'bg-gray-200 dark:bg-gray-700'
                              : 'bg-primary/10'
                          }`}>
                            {isUsed ? (
                              <User className="h-5 w-5 text-green-600" />
                            ) : isExpired ? (
                              <X className="h-5 w-5 text-red-600" />
                            ) : (
                              <Mail className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium ${
                              isExpired || isUsed
                                ? 'text-gray-500 dark:text-gray-400'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {invitation.email}
                            </p>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              isUsed 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : isExpired 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : getUserRoleBadgeColor(invitation.intendedRole)
                            }`}>
                              {isUsed ? 'Accepted' : isExpired ? 'Expired' : getUserRoleLabel(invitation.intendedRole)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>
                                Invited by {invitation.invitedBy.firstName} {invitation.invitedBy.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {isUsed && invitation.usedAt
                                  ? `Accepted ${formatRelativeTime(invitation.usedAt)}`
                                  : isExpired
                                  ? `Expired ${formatRelativeTime(invitation.expiresAt)}`
                                  : `Expires ${formatRelativeTime(invitation.expiresAt)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {hasMore && (
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={onLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
            
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Showing {invitations.length} of {totalCount} invitations
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};