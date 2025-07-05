const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTopAdmin() {
  try {
    console.log('TopAdminチームのセットアップを開始します...');

    // admin権限を持つRollを作成または取得
    const adminRoll = await prisma.roll.upsert({
      where: { id: 1 },
      update: {},
      create: {
        read: true,
        write: true,
        create: true,
        delete: true,
        admin: true,
      },
    });

    console.log('Admin Rollが作成されました:', adminRoll);

    // TopAdminチームを作成または取得
    const topAdminTeam = await prisma.team.upsert({
      where: { teamId: 1 },
      update: {
        rollId: adminRoll.id,
      },
      create: {
        teamName: 'TopAdmin',
        rollId: adminRoll.id,
      },
    });

    console.log('TopAdminチームが作成されました:', topAdminTeam);
    console.log('セットアップが完了しました！');

  } catch (error) {
    console.error('セットアップ中にエラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTopAdmin();
