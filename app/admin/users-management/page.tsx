import UsersManagementComp from "./UsersManagementComp";

export const metadata = {
  title: "ユーザー管理 | WGR Staff Page(仮称)",
  description: "このページで、作成済みカスタムを一覧できます。",
};

export default function OverlayPage() {
  return (
    <div>
      <UsersManagementComp />
    </div>
  );
}