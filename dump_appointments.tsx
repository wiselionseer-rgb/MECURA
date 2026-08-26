import React, { useEffect } from 'react';
import { useStore } from './src/store/useStore';

export function DumpAppointments() {
  const { allAppointments } = useStore();
  
  useEffect(() => {
    console.log("ALL APPOINTMENTS DUMP:", allAppointments);
  }, [allAppointments]);

  return null;
}
