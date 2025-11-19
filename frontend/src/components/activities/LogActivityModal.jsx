import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Car, Utensils, Zap, ShoppingBag, Plus, Calculator } from 'lucide-react';
import { useEmissionFactors } from '@/contexts/EmissionFactorsContext';
import { showToast } from '@/lib/utils';
import api from '@/config/api';

const CATEGORIES = [
  { value: 'Transportation', label: 'Transportation', icon: Car, color: 'bg-blue-500' },
  { value: 'Food', label: 'Food', icon: Utensils, color: 'bg-green-500' },
  { value: 'Energy', label: 'Energy', icon: Zap, color: 'bg-yellow-500' },
  { value: 'Shopping', label: 'Shopping', icon: ShoppingBag, color: 'bg-purple-500' },
];

export const LogActivityModal = ({ open, onOpenChange, onSuccess, editData = null }) => {
  const { factors, loading: factorsLoading, calculateEmission } = useEmissionFactors();

  // Form state
  const [selectedCategory, setSelectedCategory] = useState(editData?.category || '');
  const [note, setNote] = useState(editData?.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic form data based on category
  const [formData, setFormData] = useState({});

  // Initialize form data when editing
  useEffect(() => {
    if (editData && editData.inputData) {
      setFormData(editData.inputData);
    }
  }, [editData]);

  // Calculate real-time emission
  const currentEmission = selectedCategory && formData ? calculateEmission(selectedCategory, formData) : 0;

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Reset form data with defaults when category changes
    setFormData(getDefaultFormData(category));
  };

  const getDefaultFormData = (category) => {
    switch (category) {
      case 'Transportation':
        return {
          distance: '15',
          vehicleType: ''
        };
      case 'Food':
        return {
          weight: '1.5',
          foodType: ''
        };
      case 'Energy':
        return {
          energyConsumption: '25',
          energyType: 'grid_uk'
        };
      case 'Shopping':
        return {
          quantity: '1',
          itemType: ''
        };
      default:
        return {};
    }
  };

  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory) {
      showToast.error('Please select a category');
      return;
    }

    try {
      setIsSubmitting(true);

      const activityData = {
        category: selectedCategory,
        note: note.trim() || undefined, // Only include if not empty
        ...getCategoryData() // Get category-specific data
      };

      let response;
      if (editData) {
        // Update existing activity
        response = await api.put(`/activities/${editData.id}`, activityData);
        showToast.success('Activity updated successfully!');
      } else {
        // Create new activity
        response = await api.post('/activities', activityData);
        showToast.success('Activity logged successfully!');
      }

      // Reset form
      setSelectedCategory('');
      setNote('');
      setFormData({});

      // Close modal and trigger refresh
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(response.data);
      }

    } catch (error) {
      console.error('Error saving activity:', error);

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        (editData ? 'Failed to update activity' : 'Failed to log activity');

      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryData = () => {
    switch (selectedCategory) {
      case 'Transportation':
        return {
          transportData: {
            distance: parseFloat(formData.distance) || 15,
            vehicleType: formData.vehicleType
          }
        };

      case 'Food':
        return {
          foodData: {
            weight: parseFloat(formData.weight) || 1.5,
            foodType: formData.foodType
          }
        };

      case 'Energy':
        return {
          energyData: {
            energyConsumption: parseFloat(formData.energyConsumption) || 25,
            energyType: formData.energyType || 'grid_uk'
          }
        };

      case 'Shopping':
        return {
          shoppingData: {
            quantity: parseInt(formData.quantity) || 1,
            itemType: formData.itemType
          }
        };

      default:
        return {};
    }
  };

  const renderFormFields = () => {
    if (factorsLoading) {
      return <div className="text-center py-4">Loading form...</div>;
    }

    if (!selectedCategory) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a category above to see the form fields</p>
        </div>
      );
    }

    switch (selectedCategory) {
      case 'Transportation': {
        const transportFactors = factors?.transport || [];
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="15"
                  value={formData.distance || ''}
                  onChange={(e) => handleFormDataChange('distance', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select
                  value={formData.vehicleType || ''}
                  onValueChange={(value) => handleFormDataChange('vehicleType', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full min-w-0">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[300px] min-w-[200px]">
                    {transportFactors.length > 0 ? transportFactors.map((factor) => (
                      <SelectItem key={factor.key} value={factor.key} className="w-full min-w-0">
                        <span className="block truncate">{factor.label}</span>
                      </SelectItem>
                    )) : (
                      <SelectItem value="no-vehicles" disabled>
                        No vehicle types available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      }

      case 'Food': {
        const foodFactors = factors?.food || [];
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="1.5"
                  value={formData.weight || ''}
                  onChange={(e) => handleFormDataChange('weight', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="foodType">Food Type</Label>
                <Select
                  value={formData.foodType || ''}
                  onValueChange={(value) => handleFormDataChange('foodType', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full min-w-0">
                    <SelectValue placeholder="Select food" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[300px] min-w-[200px]">
                    {foodFactors.length > 0 ? foodFactors.map((factor) => (
                      <SelectItem key={factor.key} value={factor.key} className="w-full min-w-0">
                        <span className="block truncate">{factor.label}</span>
                      </SelectItem>
                    )) : (
                      <SelectItem value="no-food-types" disabled>
                        No food types available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      }

      case 'Energy': {
        const energyFactors = factors?.energy || [];
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="energyConsumption">Consumption (kWh)</Label>
                <Input
                  id="energyConsumption"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="25"
                  value={formData.energyConsumption || ''}
                  onChange={(e) => handleFormDataChange('energyConsumption', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="energyType">Energy Type</Label>
                <Select
                  value={formData.energyType || 'grid_uk'}
                  onValueChange={(value) => handleFormDataChange('energyType', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full min-w-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-w-[300px] min-w-[200px]">
                    {energyFactors.length > 0 ? energyFactors.map((factor) => (
                      <SelectItem key={factor.key} value={factor.key} className="w-full min-w-0">
                        <span className="block truncate">{factor.label}</span>
                      </SelectItem>
                    )) : (
                      <SelectItem value="no-energy-types" disabled>
                        No energy types available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      }

      case 'Shopping': {
        const shoppingFactors = factors?.shopping || [];
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  value={formData.quantity || ''}
                  onChange={(e) => handleFormDataChange('quantity', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemType">Item Type</Label>
                <Select
                  value={formData.itemType || ''}
                  onValueChange={(value) => handleFormDataChange('itemType', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full min-w-0">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[300px] min-w-[200px]">
                    {shoppingFactors.length > 0 ? shoppingFactors.map((factor) => (
                      <SelectItem key={factor.key} value={factor.key} className="w-full min-w-0">
                        <span className="block truncate">{factor.label}</span>
                      </SelectItem>
                    )) : (
                      <SelectItem value="no-item-types" disabled>
                        No item types available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pb-4">
            <Plus className="h-5 w-5" />
            {editData ? 'Edit Activity' : 'Log New Activity'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => handleCategoryChange(category.value)}
                    disabled={isSubmitting}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                      }
                    `}
                  >
                    <div className={`w-8 h-8 rounded-md ${category.color} flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Form Fields */}
          {selectedCategory && (
            <Card className="border-0 shadow-sm">
              <CardContent>
                {renderFormFields()}
              </CardContent>
            </Card>
          )}

          {/* Emission Preview */}
          {selectedCategory && currentEmission > 0 && (
            <Card className="bg-green-50/50 border-green-200 dark:bg-green-950/50 dark:border-green-800 shadow-sm">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Estimated Emission
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Carbon footprint for this activity
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-lg px-4 py-2 font-semibold text-green-700 bg-white border-green-300 dark:bg-gray-900/50 dark:border-green-700 dark:text-green-300">
                      {currentEmission.toFixed(2)} kg CO₂e
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Note Field */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this activity..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedCategory}
            >
              {isSubmitting
                ? (editData ? 'Updating...' : 'Logging...')
                : (editData ? 'Update Activity' : 'Log Activity')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
