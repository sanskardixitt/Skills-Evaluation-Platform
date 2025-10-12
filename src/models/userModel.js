const { supabase } = require("../configs/database");
const bcrypt = require("bcryptjs");
export const userModel = {
  async createUser({ email, password, fullName, role = "user" }) {
    const passwordHash = await bcrypt.hash(password, 12);

    const { data, err } = supabase
      .from("users")
      .insert([{ email, passwordHash, fullName, role }])
      .select()
      .single();

    if (err) throw new Error(err.message);

    return data;
  },
  async getUserByEmail(email) {
    const { data, err } = supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (err) throw new Error(err.message);

    return data;
  },
};
