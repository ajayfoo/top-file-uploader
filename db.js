import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const db = new PrismaClient();
const fileDb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export { db, fileDb };
