import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | WGR Staff Page(仮称)",
  description:
    "このページで、プライバシーポリシーおよび利用規約を確認できます。",
};

export default function CreatePage() {
  return (
    <div className="container mx-auto p-6 space-y-6 pt-20 mb-5">
      <Card>
        <CardHeader>
          <CardTitle>プライバシーポリシー</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-lg font-semibold">1. 取得する情報</h2>
          <ul className="list-disc pl-6">
            <li>ユーザー名、メールアドレスなどのアカウント情報</li>
            <li>利用履歴、アクセスログ、IPアドレス等の技術情報</li>
            <li>Discordなどの外部認証プロバイダから提供される情報</li>
          </ul>
          <h2 className="mt-4 text-lg font-semibold">2. 利用目的</h2>
          <ul className="list-disc pl-6">
            <li>サービス提供および運営のため</li>
            <li>不正行為の防止、トラブル対応のため</li>
            <li>利用状況の分析、改善のため</li>
          </ul>
          <h2 className="mt-4 text-lg font-semibold">3. 第三者提供</h2>
          <p>
            ユーザーの同意がある場合、または法令に基づく場合を除き、第三者に個人情報を提供することはありません。
          </p>
          <h2 className="mt-4 text-lg font-semibold">4. Cookie等の使用</h2>
          <p>
            サービスの品質向上のため、Cookieや類似の技術を利用することがあります。
          </p>
          <h2 className="mt-4 text-lg font-semibold">5. 情報の管理</h2>
          <p>
            取得した情報は適切な手段で安全に管理し、漏洩・改ざん等の防止に努めます。
          </p>
          <h2 className="mt-4 text-lg font-semibold">6. ユーザーの権利</h2>
          <p>
            ユーザーは自身の個人情報の開示、訂正、削除を求めることができます。
          </p>
          <h2 className="mt-4 text-lg font-semibold">7. お問い合わせ</h2>
          <p>個人情報に関するお問い合わせは以下までお願いします。</p>
          <blockquote className="border-l-4 pl-4">
            運営者：ichi
            <br />
            連絡先：<Link href="mailto:ichi@whitegrimreaper.jp" className="underline">ichi@whitegrimreaper.jp</Link>
          </blockquote>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>利用規約</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-lg font-semibold">第1条（適用）</h2>
          <p>
            本規約は、ユーザーと当サービスとの間のすべての関係に適用されます。
          </p>
          <h2 className="mt-4 text-lg font-semibold">第2条（利用登録）</h2>
          <p>
            外部認証（例：Discordログイン）を用いて登録されたユーザーは、登録完了時点で本規約に同意したものとみなします。
          </p>
          <h2 className="mt-4 text-lg font-semibold">第3条（禁止事項）</h2>
          <ul className="list-disc pl-6">
            <li>法令または公序良俗に反する行為</li>
            <li>他者の権利を侵害する行為</li>
            <li>当サービスの運営を妨害する行為</li>
            <li>不正アクセス、データの改ざん・取得</li>
          </ul>
          <h2 className="mt-4 text-lg font-semibold">
            第4条（サービスの提供の停止）
          </h2>
          <p>
            当サービスは、以下の場合にユーザーへの事前通知なくサービスの全部または一部を停止できるものとします。
          </p>
          <ul className="list-disc pl-6">
            <li>サーバーメンテナンスやシステム障害</li>
            <li>天災、停電などの不可抗力</li>
            <li>その他運営上必要な場合</li>
          </ul>
          <h2 className="mt-4 text-lg font-semibold">第5条（免責事項）</h2>
          <ul className="list-disc pl-6">
            <li>
              当サービスの利用により発生した損害について、一切の責任を負いません。
            </li>
            <li>当サービスは、正確性・完全性を保証するものではありません。</li>
          </ul>
          <h2 className="mt-4 text-lg font-semibold">
            第6条（利用制限および登録抹消）
          </h2>
          <p>
            ユーザーが本規約に違反した場合、当サービスは通知なく利用制限または登録抹消を行うことがあります。
          </p>
          <h2 className="mt-4 text-lg font-semibold">第7条（規約の変更）</h2>
          <p>
            必要に応じて本規約を変更することがあります。変更後の利用は、新たな規約に同意したものとみなします。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
