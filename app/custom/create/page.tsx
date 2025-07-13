import CreateCustomPage from "./create";

export const metadata = {
  title: "カスタムを作成 | WGR Staff Page(仮称)",
  description: "このページで、カスタムを作成できます。",
};

export default function CreatePage() {
  return (
    <div>
      <CreateCustomPage />
    </div>
  );
}
