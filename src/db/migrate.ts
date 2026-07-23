import { Pool } from "pg";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


const MIGRATION_DIR = path.join(
  process.cwd(),
  "src/db/migrations"
);


function checksum(content:string){
  return crypto
    .createHash("sha256")
    .update(content)
    .digest("hex");
}


async function ensureTable(){

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      checksum TEXT NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    );
  `);

}


async function getApplied(){

  const result = await pool.query(
    `
    SELECT filename, checksum
    FROM app_migrations
    ORDER BY id
    `
  );

  return result.rows;

}



async function run(){

console.log("\n🚀 GetAxe Migration Runner\n");


// Prevent multiple servers running migrations at the same time
await pool.query(`
  SELECT pg_advisory_lock(987654321);
`);

console.log("🔒 Migration lock acquired");


await ensureTable();


const applied = await getApplied();


const files = (await fs.readdir(MIGRATION_DIR))
.filter(file=>file.endsWith(".sql"))
.sort();



let appliedCount = 0;
let skippedCount = 0;



for(const file of files){

 const filePath =
 path.join(MIGRATION_DIR,file);


 const sql =
 await fs.readFile(filePath,"utf8");


 const hash =
 checksum(sql);



 const existing =
 applied.find(
 m=>m.filename===file
 );



 if(existing){

    if(existing.checksum !== hash){
        throw new Error(
        `Checksum mismatch: ${file}`
        );
    }


    console.log(`✓ ${file}`);
    skippedCount++;
    continue;

 }



 console.log(`▶ Applying ${file}`);



 const client =
 await pool.connect();


 try{

 await client.query("BEGIN");


 await client.query(sql);


 await client.query(
 `
 INSERT INTO app_migrations
(filename,checksum)
VALUES($1,$2)
 `,
 [
 file,
 hash
 ]
 );


 await client.query("COMMIT");


 console.log(`✓ Applied ${file}`);


 appliedCount++;


 }
 catch(error){

 await client.query("ROLLBACK");

 console.error(
 `✗ Failed ${file}`
 );

 throw error;

 }
 finally{

 client.release();

 }


}



console.log("\nMigration complete");
console.log(`Applied: ${appliedCount}`);
console.log(`Skipped: ${skippedCount}\n`);


await pool.query(`
  SELECT pg_advisory_unlock(987654321);
`);

console.log("🔓 Migration lock released");


await pool.end();

}


run()
.catch(err=>{
 console.error(err);
 process.exit(1);
});