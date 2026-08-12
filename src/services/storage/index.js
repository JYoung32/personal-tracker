/**
 * Active storage adapter.
 *
 * Every feature imports `storageAdapter` from here rather than importing
 * an adapter directly, so switching backends is a one-line change here —
 * no other file in the app needs to know storage changed.
 */
import { supabaseAdapter } from './supabaseAdapter';

export const storageAdapter = supabaseAdapter;
