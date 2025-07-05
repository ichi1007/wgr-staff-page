import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, email, roles, teams } = await request.json();

    // トランザクションでユーザー情報を更新
    const updatedUser = await prisma.$transaction(async (tx) => {
      // ユーザーの基本情報を更新
      const user = await tx.user.update({
        where: { id },
        data: {
          name,
          email,
        },
      });

      // 既存のロールとチームの関連を削除
      await tx.userRole.deleteMany({
        where: { userId: id },
      });

      await tx.userTeam.deleteMany({
        where: { userId: id },
      });

      // 新しいロールを追加
      if (roles && roles.length > 0) {
        await tx.userRole.createMany({
          data: roles.map((role: any) => ({
            userId: id,
            roleId: role.id,
          })),
        });
      }

      // 新しいチームを追加
      if (teams && teams.length > 0) {
        await tx.userTeam.createMany({
          data: teams.map((team: any) => ({
            userId: id,
            teamId: team.id,
          })),
        });
      }

      // 更新されたユーザー情報を取得
      return await tx.user.findUnique({
        where: { id },
        include: {
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
          discord: true,
        },
      });
    });

    // レスポンス用にデータを整形
    const formattedUser = {
      id: updatedUser!.id,
      name: updatedUser!.name,
      email: updatedUser!.email,
      status: updatedUser!.status,
      avatar: updatedUser!.discord?.avatar,
      roles: updatedUser!.userRoles.map((ur) => ur.role),
      teams: updatedUser!.userTeams.map((ut) => ut.team),
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "ユーザーの更新に失敗しました" },
      { status: 500 }
    );
  }
}
