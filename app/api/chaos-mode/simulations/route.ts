import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const simulations = await prisma.preMortemSimulation.findMany({
      where: { userId: user.id },
      include: {
        scenarios: {
          select: { id: true },
        },
        _count: {
          select: { scenarios: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(simulations);
  } catch (error) {
    console.error('Error fetching simulations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch simulations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { initiativeTitle, description, context, parameters } = body;

    if (!initiativeTitle || !description) {
      return NextResponse.json(
        { error: 'Initiative title and description are required' },
        { status: 400 }
      );
    }

    // Create simulation
    const simulation = await prisma.preMortemSimulation.create({
      data: {
        userId: user.id,
        initiativeTitle,
        description,
        context,
        parameters,
        status: 'in_progress',
      },
    });

    // Trigger background processing
    // In production, this would be a queue job
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/chaos-mode/simulations/${simulation.id}/process`, {
      method: 'POST',
    }).catch((error) => {
      console.error('Error triggering simulation processing:', error);
    });

    return NextResponse.json(simulation, { status: 201 });
  } catch (error) {
    console.error('Error creating simulation:', error);
    return NextResponse.json(
      { error: 'Failed to create simulation' },
      { status: 500 }
    );
  }
}
