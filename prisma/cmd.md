# Prisma CLI コマンド一覧

## 🎬 初期化・基本操作

| コマンド                       | 説明                                      |
|------------------------------|-------------------------------------------|
| `prisma init`                | Prismaの初期化。`schema.prisma`や`.env`生成 |
| `prisma generate`            | Prisma Clientを生成（型付きクエリAPI）       |
| `prisma studio`              | GUIでDBを操作できるツール（開発用）           |

---

## 🏗 マイグレーション（開発・本番）

| コマンド                                   | 説明                                                         |
|------------------------------------------|--------------------------------------------------------------|
| `prisma migrate dev --name wgr_db`       | スキーマ変更に基づくマイグレーション作成＋即時適用（開発用） |
| `prisma migrate reset`                   | DB初期化してマイグレーションを再適用（全データ削除）         |
| `prisma migrate deploy`                  | 本番環境で既存マイグレーションファイルを適用                 |
| `prisma migrate status`                  | 適用済み・未適用マイグレーションの状況確認                    |

---

## 🔁 スキーマとDBの同期系

| コマンド               | 説明                                                       |
|----------------------|------------------------------------------------------------|
| `prisma db push`     | Prismaスキーマを直接DBに反映（マイグレーション不要）         |
| `prisma db pull`     | 既存のDB構造をPrismaスキーマに逆生成                          |
| `prisma introspect`  | `db pull` とほぼ同じ（既存DBから `schema.prisma` を生成）    |
| `prisma db seed`     | 初期データ投入（`prisma/seed.ts` などを実行）                |

---

## 🧹 ユーティリティ

| コマンド               | 説明                                            |
|----------------------|-------------------------------------------------|
| `prisma format`      | `schema.prisma` を整形（Prettier風フォーマット） |
| `prisma validate`    | スキーマにエラーがないか検証                      |

---

## 🧪 よく使うコマンド例（実践）

```bash
# 初期化
pnpm prisma init

# スキーマ変更 → DBに適用
pnpm prisma migrate dev --name init

# クライアント生成
pnpm prisma generate

# GUIで確認
pnpm prisma studio
```

## 📚 全コマンド確認
`pnpm prisma --help`
