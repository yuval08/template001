import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

interface FilterOption {
  value: string;
  label: string;
}

interface CheckboxFilter {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface SearchAndFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    selectFilter?: {
      value: string | undefined;
      onChange: (value: string | undefined) => void;
      options: FilterOption[];
      placeholder: string;
      label?: string;
    };
    checkboxFilters?: CheckboxFilter[];
  };
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  className?: string;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  hasActiveFilters = false,
  onClearFilters,
  className,
}) => {
  const { t } = useTranslation('common');
  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 mb-4", className)}>
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={searchPlaceholder || t('searchAndFilters.searchPlaceholder')}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Select Filter */}
        {filters?.selectFilter && (
          <div className="min-w-[200px]">
            {filters.selectFilter.label && (
              <Label className="text-xs text-muted-foreground mb-1 block">
                {filters.selectFilter.label}
              </Label>
            )}
            <Select
              value={filters.selectFilter.value}
              onValueChange={filters.selectFilter.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={filters.selectFilter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filters.selectFilter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Checkbox Filters */}
        {filters?.checkboxFilters?.map((filter) => (
          <div key={filter.id} className="flex items-center space-x-2">
            <Checkbox
              id={filter.id}
              checked={filter.checked}
              onCheckedChange={filter.onChange}
            />
            <Label 
              htmlFor={filter.id}
              className="text-sm cursor-pointer whitespace-nowrap"
            >
              {filter.label}
            </Label>
          </div>
        ))}

        {/* Clear Filters Button */}
        {hasActiveFilters && onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="whitespace-nowrap"
          >
            <X className="h-4 w-4 mr-1" />
            {t('searchAndFilters.clearFilters')}
          </Button>
        )}
      </div>
    </div>
  );
};