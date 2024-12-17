import { NextResponse } from "next/server";
import { db } from "@/utils";
import { COMPANIES, DEPARTMENT, USER_DEPARTMENTS } from "@/utils/schema";
import { and, eq } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId; // Get the user ID from the token

  const { id } = await req.json(); // Extract 'id' and 'age' from the request body

  if (!id) {
    return NextResponse.json(
      { error: "Comapny ID required." },
      { status: 400 }
    );
  }

  try {
    const CompanyData = await db
      .select({
        id: COMPANIES.id,
        title: COMPANIES.title,
        description: COMPANIES.description,
        image: COMPANIES.image,
        isBanned: COMPANIES.isBanned,
        created_at: COMPANIES.created_at,
        updated_at: COMPANIES.updated_at,
      })
      .from(COMPANIES)
      .where(eq(COMPANIES.id, id))
      .execute();

    const DeparmentData = await db
      .select()
      .from(DEPARTMENT)
      .where(eq(DEPARTMENT.company_id, id))
      .execute();

    const UserDepartments = await db
      .select()
      .from(USER_DEPARTMENTS)
      .where(eq(USER_DEPARTMENTS.user_id, userId))
      .execute();

    if (CompanyData.length === 0) {
      return NextResponse.json(
        { error: "Company with the given criteria not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      companyDetails: CompanyData[0],
      DeparmentData,
      departmentCount: UserDepartments.length || 0,
    }); // Return the formatted response
  } catch (error) {
    console.error("Error fetching company by ID:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching company." },
      { status: 500 }
    );
  }
}
