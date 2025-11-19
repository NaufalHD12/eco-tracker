import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Filter, X, Search, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'Transportation', label: 'Vehicle Transportation' },
  { value: 'Food', label: 'Food & Dining' },
  { value: 'Energy', label: 'Electricity & Energy' },
  { value: 'Shopping', label: 'Shopping & Goods' },
];

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest First', icon: '↓' },
  { value: 'date_asc', label: 'Oldest First', icon: '↑' },
  { value: 'emission_desc', label: 'Highest Emission', icon: '↑' },
  { value: 'emission_asc', label: 'Lowest Emission', icon: '↓' },
];

export const ActivityFilters = ({ filters, onFiltersChange, onReset }) => {
  const [tempDateRange, setTempDateRange] = useState({
    startDate: filters.startDate ? format(new Date(filters.startDate), 'yyyy-MM-dd') : '',
    endDate: filters.endDate ? format(new Date(filters.endDate), 'yyyy-MM-dd') : '',
  });

  const handleDateRangeChange = (field, value) => {
    setTempDateRange(prev => ({
      ...prev,
      [field]: value
    }));

    // Update filters immediately for reactivity
    onFiltersChange({
      ...filters,
      [field]: value ? new Date(value).toISOString() : null,
    });
  };

  const handleSortChange = (sortString) => {
    const [sortBy, order] = sortString.split('_');
    onFiltersChange({
      ...filters,
      sortBy,
      order,
    });
  };

  const handleCategoryChange = (category) => {
    onFiltersChange({
      ...filters,
      category: category === 'all' ? null : category,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.search) count++;
    return count;
  };



  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">{getActiveFiltersCount()} active</Badge>
            )}
          </CardTitle>
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Range & Sort Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Date Range
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="date"
                  placeholder="From"
                  value={tempDateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="To"
                  value={tempDateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Sort By
            </Label>
            <Select
              value={`${filters.sortBy}_${filters.order}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Row */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Activities
          </Label>
          <Input
            placeholder="Search by details, notes, or category..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({
              ...filters,
              search: e.target.value
            })}
            className="max-w-md"
          />
        </div>
      </CardContent>
    </Card>
  );
};
