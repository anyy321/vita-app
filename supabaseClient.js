import { createClient } from "@supabase/supabase-js";

// Essas duas informações são públicas e seguras de deixar no código:
// a chave "anon" só permite o que as regras de segurança (RLS) do banco autorizam.
const SUPABASE_URL = "https://rteoqbrevblkvzyxbkjp.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0ZW9xYnJldmJsa3Z6eXhia2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTI3OTcsImV4cCI6MjEwMjQ2ODc5N30.SjdA1KnGwS74_zDvaMrIHjiSPFCUM0NXdwbpymoYVqc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
