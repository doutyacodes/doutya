import { db } from '@/utils';
import { SCHOOL, CLASS, DIVISION } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        // Query for schools, classes, and divisions in a single query
        const data = await db
        .select({
            schoolId: SCHOOL.id,
            schoolName: SCHOOL.name,
            classId: CLASS.id,
            className: CLASS.name,
            divisionId: DIVISION.id,
            divisionName: DIVISION.name
        })
        .from(SCHOOL)
        .leftJoin(CLASS, eq(CLASS.school_id, SCHOOL.id))
        .leftJoin(DIVISION, eq(DIVISION.class_id, CLASS.id));

        // Organize data into the desired structure
        const formattedData = data.reduce((acc, row) => {
        // Find or create the school object
        let school = acc.find(item => item.schoolId === row.schoolId);
        if (!school) {
            school = {
                schoolId: row.schoolId,
                schoolName: row.schoolName,
                classes: []
            };
            acc.push(school);
        }

        // Only create a class object if both classId and className are valid
        if (row.classId && row.className) {
            let classItem = school.classes.find(item => item.classId === row.classId);
            if (!classItem) {
                classItem = {
                    classId: row.classId,
                    className: row.className,
                    divisions: []
                };
                school.classes.push(classItem);
            }

            // Only add the division if divisionId and divisionName are present
            if (row.divisionId && row.divisionName) {
                classItem.divisions.push({
                    divisionId: row.divisionId,
                    divisionName: row.divisionName
                });
            }
        }

        return acc;
    }, []);
        return NextResponse.json({ schools: formattedData }, { status: 200 });

    } catch (error) {
        console.error("Error fetching schools data:", error);
        return NextResponse.json({ message: 'Error fetching schools data' }, { status: 500 });
    }
}
