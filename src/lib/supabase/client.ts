import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isConfigured = supabaseUrl?.startsWith("http") && !!supabaseKey;

export function createClient() {
  if (!isConfigured) {
    return createMockClient();
  }

  return createBrowserClient(supabaseUrl!, supabaseKey!);
}

function createMockClient() {
  const mockQuery = (): any => ({
    select: () => mockQuery(),
    insert: () => mockQuery(),
    update: () => mockQuery(),
    delete: () => mockQuery(),
    eq: () => mockQuery(),
    order: () => mockQuery(),
    single: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: (val: { data: null; error: null }) => void) =>
      resolve({ data: null, error: null }),
  });

  return {
    from: () => mockQuery(),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () =>
        Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      signUp: () =>
        Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      signOut: () => Promise.resolve({ error: null }),
    },
  } as any;
}
