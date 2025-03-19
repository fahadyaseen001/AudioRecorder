import React from 'react';
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import DashboardScreen from '../../src/screens/Dashboard';

export default function Page() {
  return (
    <>
      <SignedIn>
        <DashboardScreen />
      </SignedIn>
      <SignedOut>
        <Redirect href="/(home)" />
      </SignedOut>
    </>
  );
} 