import { NextResponse } from "next/server";
import { db } from "@/utils";
import { USER_DETAILS } from "@/utils/schema";

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
    return NextResponse.json(result);
}