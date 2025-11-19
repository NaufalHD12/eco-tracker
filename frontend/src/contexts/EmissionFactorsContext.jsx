import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/config/api';

const EmissionFactorsContext = createContext();

export const useEmissionFactors = () => {
  const context = useContext(EmissionFactorsContext);
  if (!context) {
    throw new Error('useEmissionFactors must be used within a EmissionFactorsProvider');
  }
  return context;
};

export const EmissionFactorsProvider = ({ children }) => {
  const [factors, setFactors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmissionFactors();
  }, []);

  const fetchEmissionFactors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/factors');
      setFactors(response.data.factors);
      setError(null);
    } catch (error) {
      console.error('Error fetching emission factors:', error);
      setError('Failed to load emission factors');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get factor data by category and key
  const getFactorByKey = (category, key) => {
    if (!factors || !factors[category]) return null;

    return factors[category].find(item => item.key === key);
  };

  // Helper function to calculate emission
  const calculateEmission = (category, inputData) => {
    if (!inputData) return 0;

    try {
      switch (category) {
        case 'Transportation':
          if (inputData.distance && inputData.vehicleType) {
            const factor = getFactorByKey('transport', inputData.vehicleType);
            return factor ? inputData.distance * factor.factor : 0;
          }
          break;

        case 'Food':
          if (inputData.weight && inputData.foodType) {
            const factor = getFactorByKey('food', inputData.foodType);
            return factor ? inputData.weight * factor.factor : 0;
          }
          break;

        case 'Energy':
          if (inputData.energyConsumption && inputData.energyType) {
            const factor = getFactorByKey('energy', inputData.energyType);
            return factor ? inputData.energyConsumption * factor.factor : 0;
          }
          break;

        case 'Shopping':
          if (inputData.quantity && inputData.itemType) {
            const factor = getFactorByKey('shopping', inputData.itemType);
            return factor ? inputData.quantity * factor.factor : 0;
          }
          break;
      }
    } catch (error) {
      console.error('Error calculating emission:', error);
    }

    return 0;
  };

  const value = {
    factors,
    loading,
    error,
    getFactorByKey,
    calculateEmission,
    refetch: fetchEmissionFactors
  };

  return (
    <EmissionFactorsContext.Provider value={value}>
      {children}
    </EmissionFactorsContext.Provider>
  );
};
