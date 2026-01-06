// app/api/app/maintenance/status/route.ts
import { db } from "@/utils";
import { APP_SETTINGS } from "@/utils/schema";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const settings = await db
      .select()
      .from(APP_SETTINGS)
      .limit(1);

    if (!settings.length) {
      return NextResponse.json(
        { maintenanceMode: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      maintenanceMode: settings[0].maintenanceMode === 1,
      message: settings[0].maintenanceMessage,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch maintenance status" },
      { status: 500 }
    );
  }
}
