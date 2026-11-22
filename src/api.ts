import { Platform } from 'react-native';
import Constants from 'expo-constants';

// On the web the app and its server functions share one address.
// The phone apps call the deployed site (set "apiUrl" in app.json).
const API = Platform.OS === 'web' ? '' : (Constants.expoConfig?.extra?.apiUrl ?? '');

export const speakUrl = (text: string) => `${API}/api/speak?text=${encodeURIComponent(text)}`;

export async function transcribe(uri: string): Promise<string> {
  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    form.append('audio', blob, 'attempt.webm');
  } else {
    form.append('audio', { uri, name: 'attempt.m4a', type: 'audio/mp4' } as any);
  }
  const res = await fetch(`${API}/api/score`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.text ?? '';
}
