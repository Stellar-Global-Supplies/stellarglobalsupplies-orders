import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Fetch product types from top_sku VIEW — column: skus
export const fetchProductTypes = async () => {
  const { data, error } = await supabase
    .from('top_sku')
    .select('skus')
    .order('skus');
  if (error) throw error;
  return data?.map((r) => r.skus).filter(Boolean) ?? [];
};

// Fetch materials from material_spilt VIEW — column: material_type
export const fetchMaterials = async () => {
  const { data, error } = await supabase
    .from('material_spilt')
    .select('material_type')
    .order('material_type');
  if (error) throw error;
  return data?.map((r) => r.material_type).filter(Boolean) ?? [];
};
