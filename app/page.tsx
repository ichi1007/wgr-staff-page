// import Image from "next/image";
import HomeBgVideo from "@/components/BgImage";
import DiscordButton from "@/components/DiscordButton";

export default function Home() {
  return (
    <div className="relative w-full min-h-[calc(100vh-theme(spacing.16))]">
      {/* 背景動画 */}
      <div className="absolute inset-0 -z-10">
        <HomeBgVideo />
      </div>
      {/* 中央コンテンツ */}
      <div className="flex flex-1 justify-center items-center min-h-[calc(100vh-theme(spacing.16))]">
        <div className="bg-white rounded-md px-50 py-8">
          <h1 className="text-center text-black font-bold text-2xl">
            ようこそ xxx さん
          </h1>
          <h1 className="text-center text-black font-bold text-2xl">
            今日は何をしますか？
          </h1>
          <p className="text-center">下のボタンを押して操作をしてください。</p>
          <br />
          <div className="text-center">
            <DiscordButton />
          </div>
        </div>
      </div>
    </div>
  );
}
