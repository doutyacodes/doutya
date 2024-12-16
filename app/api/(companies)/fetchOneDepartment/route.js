import { NextResponse } from "next/server";
import { db } from "@/utils";
import { COMPANIES, DEPARTMENT, USER_DEPARTMENTS, COMPANY_CHALLENGES } from "@/utils/schema";
import { and, eq } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId; // Get the user ID from the token

  const { id } = await req.json(); // Extract 'id' from the request body

  const company_id = parseInt(id)

  if (!id) {
    return NextResponse.json(
      { error: "Company ID is required." },
      { status: 400 }
    );
  }

  try {
    // Fetch company details
    const companyData = await db
      .select()
      .from(COMPANIES)
      .where(eq(COMPANIES.id, company_id))
      .execute();

    if (!companyData || companyData.length === 0) {
      return NextResponse.json(
        { error: "Company with the given criteria not found." },
        { status: 404 }
      );
    }

    // Fetch user departments associated with the company
    const userDepartments = await  db
      .select({
        department_id: USER_DEPARTMENTS.department_id,
        departmentName: DEPARTMENT.title,
      })
      .from(USER_DEPARTMENTS)
      .leftJoin(DEPARTMENT, eq(USER_DEPARTMENTS.department_id, DEPARTMENT.id))
      .where(and(eq(USER_DEPARTMENTS.user_id, userId), eq(USER_DEPARTMENTS.company_id, company_id)))
      .execute();
      // console.log("Executing query:", userDepartments.toSQL()); // Log the query
    if (!userDepartments || userDepartments.length === 0) {
      return NextResponse.json(
        { error: "No departments found for the user in the specified company." },
        { status: 404 }
      );
    }
    // Fetch challenges related to each department
    
    const challenges = await db
      .select()
      .from(COMPANY_CHALLENGES)
      .where(eq(COMPANY_CHALLENGES.company_id, company_id)) // Only filter by company_id here
      .execute();

      console.log("hello")
      // console.log("Executing query:", challenges.toSQL()); // Log the query


    // Combine user departments with their respective challenges
    const departmentDetails = userDepartments.map((department) => {
      const departmentChallenges = challenges.filter(
        (challenge) => challenge.department_id === department.department_id
      );
      return {
        ...department,
        challenges: departmentChallenges,
      };
    });

    return NextResponse.json({
      companyDetails: companyData[0],
      departments: departmentDetails,
    });
  } catch (error) {
    console.error("Error fetching company and department details:", error);
    return NextResponse.json(
 { error: "An unexpected error occurred while fetching data." },
      { status: 500 }
    );
  }
}