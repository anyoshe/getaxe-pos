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


function checksum(content: string) {
  return crypto
    .createHash("sha256")
    .update(content)
    .digest("hex");
}


async function run() {

  console.log("\n🚀 GetAxe Migration Status\n");


  const appliedResult = await pool.query(`
    SELECT filename, checksum, executed_at
    FROM app_migrations
    ORDER BY id
  `);


  const applied = appliedResult.rows;


  const files = (await fs.readdir(MIGRATION_DIR))
    .filter(file => file.endsWith(".sql"))
    .sort();


  let pending = 0;


  for (const file of files) {

    const sql = await fs.readFile(
      path.join(MIGRATION_DIR,file),
      "utf8"
    );


    const hash = checksum(sql);


    const record = applied.find(
      m => m.filename === file
    );


    if(record){

      if(record.checksum !== hash){
        console.log(`⚠ CHECKSUM FAILED ${file}`);
      }
      else {
        console.log(`✓ ${file}`);
      }

    }
    else {

      console.log(`→ ${file} pending`);
      pending++;

    }

  }


  console.log("");

  console.log(
    `Applied: ${applied.length}`
  );

  console.log(
    `Pending: ${pending}`
  );


  await pool.end();

}


run()
.catch(err=>{
 console.error(err);
 process.exit(1);
});