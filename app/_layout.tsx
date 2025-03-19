import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY } from '@env';
import { tokenCache } from 'cache';
import { Slot } from 'expo-router';


export default function RootLayout() {
  const publishableKey = EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <Slot />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
