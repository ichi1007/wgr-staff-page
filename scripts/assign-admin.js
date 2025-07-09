const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignAdminRole(discordUserId) {
  try {
    if (!discordUserId) {
      console.error('❌ Discord User IDが指定されていません');
      console.log('使用方法: node scripts/assign-admin.js <DiscordUserId>');
      return;
    }

    console.log(`ユーザー ${discordUserId} に管理者権限を付与します...`);

    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { id: discordUserId },
      include: {
        userRoles: {
          include: { role: true }
        },
        userTeams: {
          include: { team: true }
        }
      }
    });

    if (!user) {
      console.error(`❌ ユーザーが見つかりません: ${discordUserId}`);
      return;
    }

    console.log(`ユーザー「${user.name}」が見つかりました`);

    // adminロールを取得
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' }
    });

    if (!adminRole) {
      console.error('❌ adminロールが見つかりません。先にsetup-top-admin.jsを実行してください');
      return;
    }

    // TopAdminチームを取得
    const topAdminTeam = await prisma.team.findUnique({
      where: { name: 'TopAdmin' }
    });

    if (!topAdminTeam) {
      console.error('❌ TopAdminチームが見つかりません。先にsetup-top-admin.jsを実行してください');
      return;
    }

    // adminロールを割り当て
    const existingRole = user.userRoles.find(ur => ur.role.name === 'admin');
    if (!existingRole) {
      await prisma.userRole.create({
        data: {
          userId: discordUserId,
          roleId: adminRole.id,
        },
      });
      console.log('✅ adminロールを付与しました');
    } else {
      console.log('ℹ️  既にadminロールが付与されています');
    }

    // TopAdminチームに追加
    const existingTeam = user.userTeams.find(ut => ut.team.name === 'TopAdmin');
    if (!existingTeam) {
      await prisma.userTeam.create({
        data: {
          userId: discordUserId,
          teamId: topAdminTeam.id,
        },
      });
      console.log('✅ TopAdminチームに追加しました');
    } else {
      console.log('ℹ️  既にTopAdminチームに所属しています');
    }

    console.log('🎉 管理者権限の付与が完了しました！');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// コマンドライン引数からDiscord User IDを取得
const discordUserId = process.argv[2];
assignAdminRole(discordUserId);
