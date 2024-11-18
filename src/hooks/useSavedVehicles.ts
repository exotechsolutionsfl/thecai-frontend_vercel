import { useState, useEffect } from 'react';

export interface SavedVehicle {
  make: string;
  model: string;
  year: string;
}

export function useSavedVehicles() {
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSavedVehicles = () => {
      setIsLoading(true);
      const storedVehicles = localStorage.getItem('savedVehicles');
      if (storedVehicles) {
        setSavedVehicles(JSON.parse(storedVehicles));
      }
      setIsLoading(false);
    };

    loadSavedVehicles();
  }, []);

  const addVehicle = (vehicle: SavedVehicle) => {
    setIsLoading(true);
    const updatedVehicles = [...savedVehicles, vehicle];
    setSavedVehicles(updatedVehicles);
    localStorage.setItem('savedVehicles', JSON.stringify(updatedVehicles));
    setIsLoading(false);
  };

  const deleteVehicle = (index: number) => {
    setIsLoading(true);
    const updatedVehicles = savedVehicles.filter((_, i) => i !== index);
    setSavedVehicles(updatedVehicles);
    localStorage.setItem('savedVehicles', JSON.stringify(updatedVehicles));
    setIsLoading(false);
  };

  return { savedVehicles, addVehicle, deleteVehicle, isLoading };
}