/* Small typed wrapper around AsyncStorage for settings and favourites saved on the device. */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BRAND } from '../config/brand';

const key = (k: string) => `${BRAND.storagePrefix}:${k}`;

export async function load<T>(k: string): Promise<T | undefined> {
  try {
    const raw = await AsyncStorage.getItem(key(k));
    return raw == null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
}

export async function save<T>(k: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key(k), JSON.stringify(value));
  } catch {
    /* storage unavailable: keep working in memory */
  }
}
