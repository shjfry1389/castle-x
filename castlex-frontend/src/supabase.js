import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pjhznfrgpzubitrhtqwm.supabase.co";

const supabaseKey = "sb_publishable_YkZFzf9TsYlH_7NVcWNyFQ_23NeEHGV";

export const supabase = createClient(supabaseUrl, supabaseKey);
