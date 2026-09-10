import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";

export const dynamic = "force-dynamic";

/** Liveness + DB check for load balancers / hosting monitors */
export async function GET() {
  const started = Date.now();
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({
      ok: true,
      service: "getaxe-pos",
      database: "up",
      ms: Date.now() - started,
      time: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        service: "getaxe-pos",
        database: "down",
        error: e instanceof Error ? e.message : "db error",
        ms: Date.now() - started,
      },
      { status: 503 },
    );
  }
}
