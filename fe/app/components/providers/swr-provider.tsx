'use client';

import { SWRConfig } from 'swr';
import React from 'react';

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 5000,
        errorRetryCount: 3,
        // Global fetcher is not strictly required if we use our api service methods
        // but it's good practice to have some defaults
      }}
    >
      {children}
    </SWRConfig>
  );
};
