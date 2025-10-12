const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config();

const supabase = createClient(process.env.supabaseUrl, process.env.supabaseKey);

module.exports = supabase;
