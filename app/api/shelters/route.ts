import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const shelters = await prisma.shelter.findMany();
    return NextResponse.json(shelters);
  } catch (error) {
    console.error('Error fetching shelters:', error);
    return NextResponse.json({ error: 'Unable to fetch shelters' }, { status: 500 });
  }
}
