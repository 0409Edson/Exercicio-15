import { createBrowserClient } from '@supabase/ssr';

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
    return !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url' &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key'
    );
};

export function createClient() {
    if (!isSupabaseConfigured()) {
        // Return a mock client for demo mode
        return createMockClient();
    }

    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Mock client for demo mode when Supabase is not configured
function createMockClient() {
    const mockAuth = {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: (callback: any) => {
            // Return mock subscription
            return {
                data: {
                    subscription: {
                        unsubscribe: () => { }
                    }
                }
            };
        },
        signInWithPassword: async () => ({
            data: null,
            error: { message: 'Modo demo: Configure o Supabase para autenticação real' }
        }),
        signUp: async () => ({
            data: null,
            error: { message: 'Modo demo: Configure o Supabase para registro real' }
        }),
        signInWithOAuth: async () => ({
            data: null,
            error: { message: 'Modo demo: Configure o Supabase para login com Google' }
        }),
        signOut: async () => ({ error: null }),
    };

    return {
        auth: mockAuth,
    } as any;
}
