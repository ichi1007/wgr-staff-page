# Prisma CLI コマンド一覧

## 🎬 初期化・基本操作

| コマンド          | 説明                                         |
| ----------------- | -------------------------------------------- |
| `prisma init`     | Prisma の初期化。`schema.prisma`や`.env`生成 |
| `prisma generate` | Prisma Client を生成（型付きクエリ API）     |
| `prisma studio`   | GUI で DB を操作できるツール（開発用）       |

---

## 🏗 マイグレーション（開発・本番）

| コマンド                           | 説明                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| `prisma migrate dev --name wgr_db` | スキーマ変更に基づくマイグレーション作成＋即時適用（開発用） |
| `prisma migrate reset`             | DB 初期化してマイグレーションを再適用（全データ削除）        |
| `prisma migrate deploy`            | 本番環境で既存マイグレーションファイルを適用                 |
| `prisma migrate status`            | 適用済み・未適用マイグレーションの状況確認                   |

---

## 🔁 スキーマと DB の同期系

| コマンド            | 説明                                                        |
| ------------------- | ----------------------------------------------------------- |
| `prisma db push`    | Prisma スキーマを直接 DB に反映（マイグレーション不要）     |
| `prisma db pull`    | 既存の DB 構造を Prisma スキーマに逆生成                    |
| `prisma introspect` | `db pull` とほぼ同じ（既存 DB から `schema.prisma` を生成） |
| `prisma db seed`    | 初期データ投入（`prisma/seed.ts` などを実行）               |

---

## 🧹 ユーティリティ

| コマンド          | 説明                                              |
| ----------------- | ------------------------------------------------- |
| `prisma format`   | `schema.prisma` を整形（Prettier 風フォーマット） |
| `prisma validate` | スキーマにエラーがないか検証                      |
