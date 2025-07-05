import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        discord: true,
        team: {
          include: {
            roll: true,
          },
        },
      },
    });

    const formattedUsers = users.map((user) => {
      const roles = [];
      if (user.team?.roll) {
        const { roll } = user.team;
        if (roll.read) roles.push({ id: "1", name: "read", label: "読み" });
        if (roll.write) roles.push({ id: "2", name: "write", label: "書き" });
        if (roll.create) roles.push({ id: "3", name: "create", label: "作成" });
        if (roll.delete) roles.push({ id: "4", name: "delete", label: "削除" });
        if (roll.admin) roles.push({ id: "5", name: "admin", label: "管理者" });
      }

      return {
        id: user.id,
        displayName: user.name,
        email: user.email,
        roles,
        teams: user.team ? [user.team.teamName] : [],
        status: user.status,
        avatar: user.discord?.avatar,
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
