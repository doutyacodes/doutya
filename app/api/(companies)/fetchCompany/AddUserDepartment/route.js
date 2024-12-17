import { db } from '@/utils'; // Database connection
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { USER_DEPARTMENTS } from '@/utils/schema'; // Import your schema for user_departments
import { and, eq } from 'drizzle-orm';

export async function POST(req) {
  try {
    // Authenticate the user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId; // Get the user ID from the token
    const { companyId, departmentIds } = await req.json(); // Expect companyId and departmentIds in request body

    // Validate input
    if (!companyId) {
      return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
    }
    if (!departmentIds || departmentIds.length === 0) {
      return NextResponse.json({ message: 'At least one department must be selected' }, { status: 400 });
    }

    // Check for existing entries to avoid duplicates
    const existingDepartments = await db
      .select()
      .from(USER_DEPARTMENTS)
      .where(
        and(
          eq(USER_DEPARTMENTS.user_id, userId),
          eq(USER_DEPARTMENTS.company_id, companyId)
        )
      );

    const existingDepartmentIds = existingDepartments.map((dep) => dep.department_id);
    const newDepartments = departmentIds.filter(
      (id) => !existingDepartmentIds.includes(id)
    );

    if (newDepartments.length === 0) {
      return NextResponse.json({ message: 'Departments already added' }, { status: 400 });
    }

    // Insert new departments for the user
    const insertData = newDepartments.map((departmentId) => ({
      user_id: userId,
      company_id: companyId,
      department_id: departmentId,
    }));

    await db.insert(USER_DEPARTMENTS).values(insertData);

    return NextResponse.json(
      { message: 'Departments added successfully', newDepartments },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding user departments:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
