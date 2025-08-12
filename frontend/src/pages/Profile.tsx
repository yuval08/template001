import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Calendar, Shield, Building2, Briefcase, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getUserRoleLabel, getUserRoleBadgeColor, getUserRoleDescription } from '@/entities/user/types/user.types';
import { PageLayout } from '@/components/common';

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation('auth');

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">{t('profile.login_required')}</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('profile.not_available');
    // Use locale-aware formatting that respects user's system locale
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <PageLayout
      title={`${user.firstName} ${user.lastName}`}
      description={user.email}
      maxWidth="4xl"
      className="py-8"
    >
      {/* Profile Avatar */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-foreground">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('profile.personal_info')}
            </CardTitle>
            <CardDescription>
              {t('profile.personal_info_description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('profile.first_name')}</label>
                <p className="text-sm">{user.firstName}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('profile.last_name')}</label>
                <p className="text-sm">{user.lastName}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('profile.email')}</label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('profile.status')}</label>
                <div className="flex items-center gap-2">
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? t('profile.active') : t('profile.inactive')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('profile.role_permissions')}
            </CardTitle>
            <CardDescription>
              {t('profile.role_permissions_description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{getUserRoleLabel(user.role)}</p>
                <p className="text-sm text-muted-foreground">{getUserRoleDescription(user.role)}</p>
              </div>
              <Badge className={getUserRoleBadgeColor(user.role)}>
                {getUserRoleLabel(user.role)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {t('profile.work_info')}
            </CardTitle>
            <CardDescription>
              {t('profile.work_info_description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('profile.department')}</label>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{user.department || t('profile.not_specified')}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('profile.job_title')}</label>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{user.jobTitle || t('profile.not_specified')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('profile.account_activity')}
            </CardTitle>
            <CardDescription>
              {t('profile.account_activity_description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('profile.account_created')}</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('profile.last_updated')}</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </PageLayout>
  );
};

export default Profile;