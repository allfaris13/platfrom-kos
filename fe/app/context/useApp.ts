import { useContext } from 'react';
import { AppContext } from './AppContext';
import { AppContextType } from './types';

/**
 * Custom hook untuk mengakses Global State
 * Gunakan di komponen manapun tanpa perlu manual useContext
 * 
 * @example
 * const { bookings, addBooking, rooms } = useApp();
 */
export function useApp(): AppContextType {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
}
