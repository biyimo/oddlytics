/*
 * Authentication. SIMULATED: any valid email + 6-character password works and
 * nothing leaves the device. Swap these functions for your auth provider
 * (Firebase Auth, Supabase, Auth0, your own API...). Keep the same signatures.
 */
import type { User } from '../types';

const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function signUp(name: string, email: string, _password: string): Promise<User> {
  await wait();
  return { name: name.trim(), email: email.trim() };
}

export async function signIn(email: string, _password: string): Promise<User> {
  await wait();
  return { name: email.split('@')[0], email: email.trim() };
}

export async function socialSignIn(provider: 'Google' | 'Apple'): Promise<User> {
  await wait();
  return { name: `${provider} user`, email: `you@${provider.toLowerCase()}.com` };
}

export async function requestPasswordReset(_email: string): Promise<void> {
  await wait();
}

export async function signOut(): Promise<void> {
  await wait(100);
}

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
