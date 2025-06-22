import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://nibabvqhvyrtqlyaobvl.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYmFidnFodnlydHFseWFvYnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODg2ODUsImV4cCI6MjA2MzI2NDY4NX0.KwbFF5zba1YAaODQ7Dh4YljRtxqguwa4c9-Gk7VXOGU"

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
