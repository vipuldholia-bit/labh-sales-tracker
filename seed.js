import 'dotenv/config';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import pg from 'pg';
const {Pool}=pg;
if (!process.env.DATABASE_URL || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error('DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD required');
if(process.env.ADMIN_PASSWORD.length<12) throw new Error('Admin password must have at least 12 characters');
const pool=new Pool({connectionString:process.env.DATABASE_URL});
try {
 await pool.query(fs.readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
 const hash=await bcrypt.hash(process.env.ADMIN_PASSWORD,12);
 await pool.query(`INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,'admin') ON CONFLICT(email) DO NOTHING`,['LABH Administrator',process.env.ADMIN_EMAIL.toLowerCase(),hash]);
 console.log('Schema initialized; admin created if email was not present.');
} finally {await pool.end();}
