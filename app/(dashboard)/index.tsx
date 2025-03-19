import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import React from 'react';

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
