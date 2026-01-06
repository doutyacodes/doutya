// app/api/app/maintenance/update/route.ts
import { db } from "@/utils";
import { APP_SETTINGS } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { maintenanceMode, message } = body;

    await db
      .update(APP_SETTINGS)
      .set({
        maintenanceMode: maintenanceMode ? 1 : 0,
        maintenanceMessage: message,
      })
      .where(eq(APP_SETTINGS.id, 1));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Maintenance update error:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance mode" },
      { status: 500 }
    );
  }
}