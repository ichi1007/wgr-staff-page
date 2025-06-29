import CustomListPage from "./list";

export const metadata = {
  title: "カスタム一覧 | WGR Staff Page(仮称)",
  description: "このページで、作成済みカスタムを一覧できます。",
};

export default function ListPage() {
  return (
    <div>
      <CustomListPage />
    </div>
  );
}
