import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfzenkilvptfapfijhbs.supabase.co';
const supabaseKey = 'sb_publishable_NNhU7X8uzIqfzAyilq6zQQ_SHlqUh57';

export const supabase = createClient(supabaseUrl, supabaseKey);
