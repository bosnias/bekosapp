import { router } from 'expo-router';

// Back to the journey map (going back keeps one map in history, so the mascot hops on return).
export const toMap = () => (router.canGoBack() ? router.back() : router.replace('/'));
