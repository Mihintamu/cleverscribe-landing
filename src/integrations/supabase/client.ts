// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cbgpennynyiizazlwjpn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZ3Blbm55bnlpaXphemx3anBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjA1NDksImV4cCI6MjA1NzI5NjU0OX0.MNYvkBuP8g2WrOXvchDDTrr0Ag_DMTD3yOG4zDewnmo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);