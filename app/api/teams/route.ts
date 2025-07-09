import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "チームの取得に失敗しました" },
      { status: 500 }
    );
  }
}
