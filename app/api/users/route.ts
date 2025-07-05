import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        discord: true,
        userRoles: {
          include: {
            role: true,
          },
        },
        userTeams: {
          include: {
            team: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // レスポンス用にデータを整形
    const response = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      avatar: user.discord?.avatar,
      roles: user.userRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        label: ur.role.label,
      })),
      teams: user.userTeams.map((ut) => ({
        id: ut.team.id,
        name: ut.team.name,
      })),
      createdAt: user.createdAt,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
