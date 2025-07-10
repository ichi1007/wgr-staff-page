const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupRolesAndTeams() {
  try {
    console.log('基本ロールとチームのセットアップを開始します...');

    // 基本ロールを作成
    const roles = [
      { name: 'read', label: '読み' },
      { name: 'write', label: '書き' },
      { name: 'create', label: '作成' },
      { name: 'delete', label: '削除' },
      { name: 'admin', label: '管理者' },
    ];

    console.log('ロールを作成中...');
    for (const roleData of roles) {
      const role = await prisma.role.upsert({
        where: { name: roleData.name },
        update: {
          label: roleData.label,
        },
        create: {
          name: roleData.name,
          label: roleData.label,
        },
      });
      console.log(`ロール「${role.label}」が作成されました (ID: ${role.id})`);
    }

    // 基本チームを作成
    const teams = [
      { name: 'TopAdmin' },
      { name: '開発チーム' },
      { name: 'デザインチーム' },
      { name: 'マーケティングチーム' },
      { name: '営業チーム' },
    ];

    console.log('チームを作成中...');
    for (const teamData of teams) {
      const team = await prisma.team.upsert({
        where: { name: teamData.name },
        update: {},
        create: {
          name: teamData.name,
        },
      });
      console.log(`チーム「${team.name}」が作成されました (ID: ${team.id})`);
    }

    console.log('✅ セットアップが完了しました！');
    console.log('');
    console.log('📝 次のステップ:');
    console.log('1. Prisma Studio を開いて確認: npx prisma studio');
    console.log('2. 管理者ユーザーにTopAdminチームとadminロールを手動で割り当て');
    console.log('3. または下記のコマンドで特定ユーザーに管理者権限を付与:');
    console.log('   pnpm db:assign:admin <DiscordUserId>');

  } catch (error) {
    console.error('❌ セットアップ中にエラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupRolesAndTeams();
