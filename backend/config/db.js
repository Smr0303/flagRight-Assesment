const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const connectToDb = async () => {
  try {
    // Test the connection Pby checking auth configuration
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    console.log("Connected to the database");

    return true;
  } catch (error) {
    console.error("Error connecting to database:", error.message);

    return false;
  }
};

module.exports = { supabase, connectToDb };
