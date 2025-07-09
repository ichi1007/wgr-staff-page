import MypageComp from "./mypage";

export const metadata = {
  title: "マイページ | WGR Staff Page(仮称)",
  description: "このページで、カスタムを作成できます。",
};

export default function MyPage() {
  return (
    <div>
      <MypageComp />
    </div>
  );
}
