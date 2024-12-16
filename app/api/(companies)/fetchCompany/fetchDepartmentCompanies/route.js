import { db } from "@/utils"; // Database connection
import { authenticate } from "@/lib/jwtMiddleware";
import { USER_DEPARTMENTS, COMPANIES, DEPARTMENT } from "@/utils/schema"; // Import your database schema
import { eq, inArray } from "drizzle-orm";

export async function GET(req) {
  try {
    // Authenticate the user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userId = authResult.decoded_Data.userId; // Extract the authenticated user ID

    // Fetch the departments followed by the user
    const userDepartments = await db
      .select({
        departmentId: USER_DEPARTMENTS.department_id,
        companyId: DEPARTMENT.company_id,
      })
      .from(USER_DEPARTMENTS)
      .leftJoin(DEPARTMENT, eq(USER_DEPARTMENTS.department_id, DEPARTMENT.id))
      .where(eq(USER_DEPARTMENTS.user_id, userId));

    if (userDepartments.length === 0) {
      return new Response(
        JSON.stringify({ message: "No departments followed by the user." }),
        { status: 404 }
      );
    }

    // Extract unique company IDs
    const companyIds = [...new Set(userDepartments.map((dep) => dep.companyId))];

    // Fetch companies based on the unique company IDs
    const companies = await db
      .select()
      .from(COMPANIES)
      .where(inArray(COMPANIES.id, companyIds));

    return new Response(
      JSON.stringify({
        message: "Companies fetched successfully.",
        companies,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching companies:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error." }),
      { status: 500 }
    );
  }
}
