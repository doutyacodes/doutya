import { NextResponse } from "next/server";
import { db } from "@/utils";
import { USER_DETAILS } from "@/utils/schema";
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm/expressions';

const SECRET_KEY = 'mySecrectKeyForProject';

export async function POST(req, res) {
    const data = await req.json();
    const result = await db.insert(USER_DETAILS)
        .values({
            name: data?.name,
            gender: data?.gender,
            mobile: data?.mobile,
            birth_date: new Date(data?.birth_date),
            password: data?.password,
            username: data?.username,
            education: data?.education,
            student: data?.student,
            college: data?.college,
            university: data?.university,
            yearOfPassing: data?.yearOfPassing,
            monthOfPassing: data?.monthOfPassing
        })

    const user = await db
        .select()
        .from(USER_DETAILS)
        .where(eq(USER_DETAILS.username, data?.username))
        // .single();

    const token = jwt.sign(
        { id: user.id },
        SECRET_KEY,
        { expiresIn: '1h' }
    );
    return NextResponse.json({ user, token });
}