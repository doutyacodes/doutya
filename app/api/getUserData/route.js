import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm'; // Ensure these imports match your ORM version
import { authenticate } from '@/lib/jwtMiddleware';
import { USER_DETAILS, USER_KEYS, INSTITUTION } from '@/utils/schema';
import { decryptText, encryptText } from '@/utils/encryption';
import { generateUserKey } from '@/lib/generateUserKey';

export async function GET(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }
    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    try {
        const [user] = await db
            .select()
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId));
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 } // Not Found
            );
        }
        // Decrypt fields only if they exist
        try {
            if (user.password) {
                user.password = decryptText(user.password);
            }
            if (user.college) {
                user.college = decryptText(user.college);
            }
            if (user.university) {
                user.university = decryptText(user.university);
            }
        } catch (decryptError) {
            console.error("Error decrypting user data", decryptError);
            return NextResponse.json({ message: 'Error decrypting user data' }, { status: 500 });
        }

        // Check if unique key exists in user_keys table
        const [userKeyEntry] = await db
            .select()
            .from(USER_KEYS)
            .where(eq(USER_KEYS.user_id, userId));

        let userKey = userKeyEntry ? userKeyEntry.unique_key : null;

        // Generate and save unique key if it doesn't exist
        if (!userKey) {
            userKey = generateUserKey(user.id, user.username);            
            try {
                await db.insert(USER_KEYS).values({
                    user_id: userId,
                    unique_key: userKey,
                });
            } catch (saveError) {
                console.error("Error saving user key", saveError);
                return NextResponse.json({ message: 'Error saving user key' }, { status: 500 });
            }
        }

        // Fetch institution details if user belongs to an institution
        let institution = null;
        if (user.institution_id) {
          try {
            const [inst] = await db
              .select({
                id: INSTITUTION.id,
                name: INSTITUTION.name,
                logo: INSTITUTION.logo,
                type: INSTITUTION.type,
                address: INSTITUTION.address,
                website: INSTITUTION.website,
                board: INSTITUTION.board,
                city: INSTITUTION.city,
                state: INSTITUTION.state,
              })
              .from(INSTITUTION)
              .where(eq(INSTITUTION.id, user.institution_id));
            if (inst) {
              institution = inst;
            }
          } catch (instErr) {
            console.error("Error fetching institution for user:", instErr);
          }
        }

        // Include unique key and institution details in the response
        return NextResponse.json({ ...user, userKey, institution }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user data", error);
        return NextResponse.json({ message: 'Error fetching user data' }, { status: 500 });
    }
}