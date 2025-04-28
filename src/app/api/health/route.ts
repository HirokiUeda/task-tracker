import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  try {
    const result: { ok: number }[] = await prisma.$queryRaw`SELECT 1 as ok`;
    return NextResponse.json({ db: result[0].ok === 1 });
  } catch (e) {
    return NextResponse.json(
      { db: false, error: (e as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
