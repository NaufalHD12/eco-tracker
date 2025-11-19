import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, Utensils, Zap, ShoppingBag, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_ICONS = {
  Transportation: { icon: Car, color: 'bg-blue-500' },
  Food: { icon: Utensils, color: 'bg-green-500' },
  Energy: { icon: Zap, color: 'bg-yellow-500' },
  Shopping: { icon: ShoppingBag, color: 'bg-purple-500' },
};

export const ActivityCard = ({
  activity,
  onEdit,
  onDelete,
  onViewDetails,
  showActions = true,
  compact = false
}) => {
  const { icon: Icon, color } = CATEGORY_ICONS[activity.category] || CATEGORY_ICONS.Transportation;

  const formatEmission = (emission) => {
    if (emission >= 1000) {
      return `${(emission / 1000).toFixed(1)}t`; // Tons
    } else if (emission >= 1) {
      return `${emission.toFixed(1)}kg`; // Kilograms
    } else {
      return `${(emission * 1000).toFixed(0)}g`; // Grams
    }
  };

  const formatDescription = (details) => {
    // Truncate description if too long
    return details.length > 50 ? `${details.substring(0, 50)}...` : details;
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${compact ? 'p-3' : ''}`}>
      <CardContent className={`p-4 ${compact ? 'p-3' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Category Icon */}
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
              <Icon className="h-5 w-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground truncate">
                    {activity.details}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(activity.date), 'MMM dd, yyyy • HH:mm')}
                  </p>
                  {activity.note && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      "{activity.note}"
                    </p>
                  )}
                </div>

                {/* Emission Badge */}
                <Badge variant="secondary" className="shrink-0">
                  {formatEmission(activity.emission)} CO₂e
                </Badge>
              </div>

              {/* Category Badge */}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {activity.category}
                </Badge>
                {activity.details && (
                  <span className="text-xs text-muted-foreground">
                    {formatDescription(activity.details)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(activity)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(activity)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(activity)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
