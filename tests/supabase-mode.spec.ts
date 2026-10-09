import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Exercise module initialization with isolated env/dependencies. No credentials or network.
function loadBackend(env: Record<string, string | undefined>) {
  const calls: unknown[][] = [];
  const exports: Record<string, any> = {};
  const code = ts.transpileModule(readFileSync(resolve('services/supabase.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  runInNewContext(code, {
    exports,
    process: { env },
    require: (name: string) => {
      if (name === '@supabase/supabase-js') return {
        createClient: (...args: unknown[]) => { calls.push(args); return { configured: true }; },
      };
      return {};
    },
  });
  return { backend: exports, calls };
}

for (const env of [{}, { EXPO_PUBLIC_SUPABASE_URL: 'https://test.invalid' }, { EXPO_PUBLIC_SUPABASE_ANON_KEY: 'test-public-key' }]) {
  test(`missing configuration starts locally (${Object.keys(env).join(',') || 'empty'})`, () => {
    const { backend, calls } = loadBackend(env);
    expect(backend.isLocalMode).toBe(true);
    expect(backend.supabase).toBeNull();
    expect(() => backend.requireSupabase()).toThrow('unavailable in local mode');
    expect(calls).toHaveLength(0);
  });
}

test('explicit local mode does not initialize a client even with cloud configuration', () => {
  const { backend, calls } = loadBackend({
    EXPO_PUBLIC_LOCAL_MODE: 'true',
    EXPO_PUBLIC_SUPABASE_URL: 'https://test.invalid',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: 'test-public-key',
  });
  expect(backend.supabase).toBeNull();
  expect(calls).toHaveLength(0);
});

test('complete cloud configuration keeps the Supabase integration available', () => {
  const { backend, calls } = loadBackend({
    EXPO_PUBLIC_SUPABASE_URL: 'https://test.invalid',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: 'test-public-key',
  });
  expect(backend.isLocalMode).toBe(false);
  expect(backend.requireSupabase()).toEqual({ configured: true });
  expect(calls).toHaveLength(1);
});
