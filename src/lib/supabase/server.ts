import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isConfigured = supabaseUrl?.startsWith("http") && !!supabaseKey;

export async function createClient() {
  if (!isConfigured) {
    return createMockClient();
  }

  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      db: { schema: "ylz_crm" },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출 시 무시
          }
        },
      },
    }
  );
}

/**
 * RLS를 우회하는 Admin 클라이언트 (서버 전용)
 * 파이프라인 단계, 태그 등 공용 데이터 조회에 사용
 */
export function createAdminClient() {
  const runtimeServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isConfigured || !runtimeServiceRoleKey) {
    return createMockClient();
  }

  return createServerClient(
    supabaseUrl!,
    runtimeServiceRoleKey,
    {
      db: { schema: "ylz_crm" },
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
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
