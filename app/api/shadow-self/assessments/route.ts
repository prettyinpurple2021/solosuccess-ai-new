import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SHADOW_SELF_QUESTIONS } from '@/lib/data/shadow-self-questions';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assessments = await prisma.shadowSelfAssessment.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        report: true,
      },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has an in-progress assessment
    const existingAssessment = await prisma.shadowSelfAssessment.findFirst({
      where: {
        userId: session.user.id,
        status: 'in_progress',
      },
    });

    if (existingAssessment) {
      return NextResponse.json(existingAssessment);
    }

    // Create new assessment
    const assessment = await prisma.shadowSelfAssessment.create({
      data: {
        userId: session.user.id,
        status: 'in_progress',
        currentStep: 0,
        totalSteps: SHADOW_SELF_QUESTIONS.length,
        responses: {},
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
