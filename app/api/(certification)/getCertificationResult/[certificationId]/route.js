import { db } from '@/utils';
import { USER_CERTIFICATION_COMPLETION, CERTIFICATIONS, USER_DETAILS, CAREER_GROUP, CLUSTER, SECTOR, USER_CAREER, USER_CLUSTER, USER_SECTOR } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(request, { params }) {
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const { certificationId } = params;
    
    if (!certificationId) {
        return NextResponse.json({ message: 'Invalid certificationId' }, { status: 400 });
    }

    try {
        const certificationDetails = await db
            .select({
                certificationName: CERTIFICATIONS.certification_name,
                certificateID: USER_CERTIFICATION_COMPLETION.certificate_id,
                userName: USER_DETAILS.name,
                username: USER_DETAILS.username,
                ratingStars: USER_CERTIFICATION_COMPLETION.rating_stars,
                scorePercentage: USER_CERTIFICATION_COMPLETION.score_percentage,
                level: USER_CERTIFICATION_COMPLETION.level,       
                issuedAt: USER_CERTIFICATION_COMPLETION.issued_at,
                updatedAt: USER_CERTIFICATION_COMPLETION.updated_at,
                scopeId: CERTIFICATIONS.scope_id,
                scopeType: CERTIFICATIONS.scope_type,
            })
            .from(USER_CERTIFICATION_COMPLETION)
            .innerJoin(CERTIFICATIONS, eq(USER_CERTIFICATION_COMPLETION.certification_id, CERTIFICATIONS.id))
            .innerJoin(USER_DETAILS, eq(USER_CERTIFICATION_COMPLETION.user_id, USER_DETAILS.id))
            .where(
                and(
                    eq(USER_CERTIFICATION_COMPLETION.user_id, userId),
                    eq(USER_CERTIFICATION_COMPLETION.certification_id, certificationId)
                )
            )
            .execute();

        if (certificationDetails.length === 0) {
            return NextResponse.json({ message: 'No certification details found' }, { status: 404 });
        }

        const cert = certificationDetails[0];
        let careerField = '';

        // Resolve scope name based on scope_type
        if (cert.scopeType === 'career') {
            const cg = await db.select({ name: CAREER_GROUP.career_name }).from(CAREER_GROUP).where(eq(CAREER_GROUP.id, cert.scopeId)).limit(1);
            if (cg.length && cg[0].name) {
                careerField = cg[0].name;
            } else {
                const uc = await db.select({ name: CAREER_GROUP.career_name }).from(USER_CAREER).innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id)).where(eq(USER_CAREER.id, cert.scopeId)).limit(1);
                if (uc.length && uc[0].name) careerField = uc[0].name;
            }
        } else if (cert.scopeType === 'cluster') {
            const cl = await db.select({ name: CLUSTER.name }).from(CLUSTER).where(eq(CLUSTER.id, cert.scopeId)).limit(1);
            if (cl.length && cl[0].name) {
                careerField = cl[0].name;
            } else {
                const ucl = await db.select({ name: CLUSTER.name }).from(USER_CLUSTER).innerJoin(CLUSTER, eq(USER_CLUSTER.cluster_id, CLUSTER.id)).where(eq(USER_CLUSTER.id, cert.scopeId)).limit(1);
                if (ucl.length && ucl[0].name) careerField = ucl[0].name;
            }
        } else if (cert.scopeType === 'sector') {
            const sc = await db.select({ name: SECTOR.name }).from(SECTOR).where(eq(SECTOR.id, cert.scopeId)).limit(1);
            if (sc.length && sc[0].name) {
                careerField = sc[0].name;
            } else {
                const usc = await db.select({ name: SECTOR.name }).from(USER_SECTOR).innerJoin(SECTOR, eq(USER_SECTOR.sector_id, SECTOR.id)).where(eq(USER_SECTOR.id, cert.scopeId)).limit(1);
                if (usc.length && usc[0].name) careerField = usc[0].name;
            }
        }

        return NextResponse.json({
            certificationName: cert.certificationName,
            certificateID: cert.certificateID,
            issuedAt: cert.issuedAt,
            userName: cert.userName,
            username: cert.username,
            ratingStars: cert.ratingStars,
            scorePercentage: cert.scorePercentage,
            updatedAt: cert.updatedAt,
            careerField: careerField || "Professional Development",
            scopeType: cert.scopeType,
            level: cert.level
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching certification details:", error);
        return NextResponse.json({ message: 'Error fetching certification details' }, { status: 500 });
    }
}
