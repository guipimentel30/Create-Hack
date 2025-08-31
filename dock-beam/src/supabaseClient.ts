import { createClient } from '@supabase/supabase-js'

// 1. Acessa as variáveis de ambiente a partir de `import.meta.env`
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL
const supabaseKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY

// 2. (Opcional, mas recomendado) Adiciona uma verificação para garantir que as chaves foram carregadas
if (!supabaseUrl || !supabaseKey) {
  throw new Error("As variáveis de ambiente do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) não foram definidas. Verifique seu arquivo .env.");
}

// 3. Cria o cliente do Supabase com as variáveis carregadas
export const supabase = createClient(supabaseUrl, supabaseKey)