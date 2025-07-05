"use client";

import { Blocks, Settings, Table, Images, Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import BgImage from "@/public/img/apex_demo_playgame_display.png";
import BackpackImage from "@/public/svg/Backpack_lv3_lv4.svg";
import KnockdownShieldImage from "@/public/svg/Knockdown_Shield.svg";
import Syringe from "@/public/svg/Syringe.svg";
import MedKit from "@/public/svg/Med_Kit.svg";
import ShieldBattery from "@/public/svg/Shield_Battery.svg";
import ShieldCell from "@/public/svg/Shield_Cell.svg";
import PhoenixKit from "@/public/svg/Phoenix_Kit.svg";
import FragGrenade from "@/public/svg/Frag_Grenade.svg";
import ArcStar from "@/public/svg/Arc_Star.svg";
import ThermiteGrenade from "@/public/svg/Thermite_Grenade.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OverlayComp() {
  const [displaySettings, setDisplaySettings] = useState({
    scoreBar: true,
    teamInfo: true,
    inventory: true,
    teamElimination: true,
  });

  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const toggleDisplay = (key: keyof typeof displaySettings) => {
    setDisplaySettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = () => {
    setBackgroundImage(null);
  };

  return (
    <div className="mb-8 pt-20">
      <style jsx>{`
        .inventoryBox {
          background-image: url("/svg/iibenntori.svg");
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
          height: 60px;
          width: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-left: -15px;
        }
      `}</style>
      {/* マッチ中オーバーレイ設定 */}
      <div>
        <div className="font-extrabold text-2xl mb-3 flex justify-center items-center gap-3">
          <Blocks />
          <h1>マッチ中オーバーレイ設定</h1>
          <p className="text-sm text-gray-500">必ずパソコンで見てください</p>
        </div>
        <div className="aspect-video w-[70vw] max-h-[82vh] border-2 border-dotted border-gray-500 mx-auto relative overflow-auto">
          <div className="absolute inset-0 w-full h-full -z-50">
            <Image
              src={BgImage}
              alt="BgImage"
              fill
              className="object-cover aspect-video object-center"
            />
          </div>
          {/* 画面上部スコアバー */}
          {displaySettings.scoreBar && (
            <div className="bg-black w-full h-[30px] flex gap justify-center items-center relative">
              <div className="bg-blue-400 px-15 mr-10 flex items-center h-full">
                <span className="font-extrabold text-sm text-white">
                  Match1
                </span>
              </div>
              <div className="my-1 flex justify-between items-center border-r border-r-gray-600 mr-5">
                <div className="flex items-center text-white font-bold mr-10">
                  <p className="text-sm mr-2 text-black bg-white px-2 rounded">
                    1<span className="text-[10px] ml-1">位</span>
                  </p>
                  <p className="pr-4">20</p>
                  <p>Xxxxxxチーム</p>
                </div>
                <div className="flex mr-2">
                  <div className="w-[5px] h-[25px] bg-white mx-[2px]" />
                  <div className="w-[5px] h-[25px] bg-red-500 mx-[2px]" />
                  <div className="w-[5px] h-[25px] bg-green-500 mx-[2px]" />
                </div>
              </div>
              <div className="my-1 flex justify-between items-center border-r border-r-gray-600 mr-5">
                <div className="flex items-center text-white font-bold mr-10 opacity-50">
                  <p className="text-sm mr-2 text-black bg-white px-2 rounded">
                    2<span className="text-[10px] ml-1">位</span>
                  </p>
                  <p className="pr-4">20</p>
                  <p>Xxxxxxチーム</p>
                </div>
                <div className="flex mr-2 opacity-50">
                  <div className="w-[5px] h-[25px] bg-white mx-[2px]" />
                  <div className="w-[5px] h-[25px] bg-white mx-[2px]" />
                  <div className="w-[5px] h-[25px] bg-white mx-[2px]" />
                </div>
              </div>
              <div className="my-1 flex justify-between items-center border-r border-r-gray-600 mr-5">
                <div className="flex items-center text-white font-bold mr-10">
                  <p className="text-sm mr-2 text-black bg-white px-2 rounded">
                    3<span className="text-[10px] ml-1">位</span>
                  </p>
                  <p className="pr-4">20</p>
                  <p>Xxxxxxチーム</p>
                </div>
                <div className="flex mr-2">
                  <div className="w-[5px] h-[25px] bg-white mx-[2px]" />
                  <div className="w-[5px] h-[25px] bg-red-500 mx-[2px]" />
                  <div className="w-[5px] h-[25px] bg-green-500 mx-[2px]" />
                </div>
              </div>
              <div className="my-1 flex justify-between items-center mr-5">
                <div className="flex items-center text-white font-bold mr-10">
                  <p className="text-sm mr-2 text-black bg-white px-2 rounded">
                    4<span className="text-[10px] ml-1">位</span>
                  </p>
                  <p className="pr-4">20</p>
                  <p>Xxxxxxチーム</p>
                </div>
                <div className="flex mr-2">
                  <div className="w-[5px] h-[25px] bg-white mx-[2px]" />
                  <div className="w-[5px] h-[25px] bg-red-500 mx-[2px]" />
                  <div className="w-[5px] h-[25px] bg-green-500 mx-[2px]" />
                </div>
              </div>
            </div>
          )}
          {/* チーム情報 */}
          {displaySettings.teamInfo && (
            <div className="absolute left-3 bottom-52 z-20">
              <div className="bg-black px-3 py-2 shadow-lg">
                <div className="flex items-center mb-3 px-2 border-b font-extrabold">
                  <span className="text-xs text-white mr-2">
                    <span className="text-[8px]">No.</span>01
                  </span>
                  <span className="text-sm text-white mr-2">Xxxxxxチーム</span>
                  <span className="ml-auto flex items-center gap-1">
                    <span className="bg-white text-black text-xs px-1 rounded">
                      1<span className="text-[7px]">位</span>
                    </span>
                    <span className="bg-white text-black text-xs px-1 rounded">
                      12
                    </span>
                  </span>
                </div>
                <div className="flex gap-5">
                  <div className="flex flex-col items-center w-[60px]">
                    <Skeleton className="h-[65px] w-[65px] rounded bg-gray-300" />
                    <span className="text-xs text-white mt-1 truncate w-full text-center">
                      xxxx
                    </span>
                  </div>
                  <div className="flex flex-col items-center w-[60px]">
                    <Skeleton className="h-[65px] w-[65px] rounded bg-gray-300" />
                    <span className="text-xs text-white mt-1 truncate w-full text-center">
                      xxxxx
                    </span>
                  </div>
                  <div className="flex flex-col items-center w-[60px]">
                    <Skeleton className="h-[65px] w-[65px] rounded bg-gray-300" />
                    <span className="text-xs text-white mt-1 truncate w-full text-center">
                      xxxxxxxxxx
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* インベントリ表示 */}
          {displaySettings.inventory && (
            <div className="absolute bottom-30 right-5 flex">
              <div className="mr-5">
                <div className="inventoryBox">
                  <Image
                    src={BackpackImage}
                    alt="Backpack lv3/lv4"
                    width={40}
                    style={{
                      filter:
                        "drop-shadow(0 0 7px #B18F00) drop-shadow(0 0 1px #B18F00) drop-shadow(0 0 1px #B18F00)",
                    }}
                  />
                </div>
                <div className="inventoryBox">
                  <Image
                    src={KnockdownShieldImage}
                    alt="Backpack lv3/lv4"
                    width={40}
                    style={{
                      filter:
                        "drop-shadow(0 0 7px #a259e6) drop-shadow(0 0 1px #a259e6) drop-shadow(0 0 1px #a259e6)",
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex">
                  <div className="inventoryBox relative">
                    <p className="text-white font-extrabold absolute left-2 bottom-1 z-10">
                      12
                    </p>
                    <Image src={Syringe} alt="Syringe" width={40} />
                  </div>
                  <div className="inventoryBox relative">
                    <p className="text-white font-extrabold absolute left-2 bottom-1 z-10">
                      2
                    </p>
                    <Image src={MedKit} alt="Med Kit" width={40} />
                  </div>
                  <div className="inventoryBox relative">
                    <p className="text-white font-extrabold absolute left-2 bottom-1 z-10">
                      12
                    </p>
                    <Image
                      src={ShieldBattery}
                      alt="Shield Battery"
                      width={40}
                    />
                  </div>
                  <div className="inventoryBox relative">
                    <p className="text-white font-extrabold absolute left-2 bottom-1 z-10">
                      20
                    </p>
                    <Image src={ShieldCell} alt="Shield Cell" width={40} />
                  </div>
                </div>
                <div className="flex">
                  <div className="inventoryBox relative">
                    <p className="text-white font-extrabold absolute left-2 bottom-1 z-10">
                      2
                    </p>
                    <Image src={PhoenixKit} alt="Phoenix Kit" width={40} />
                  </div>
                  <div className="inventoryBox relative">
                    <p className="text-white font-extrabold absolute left-2 bottom-1 z-10">
                      3
                    </p>
                    <Image src={FragGrenade} alt="Frag Grenade" width={40} />
                  </div>
                  <div className="inventoryBox relative">
                    <p className="text-white font-extrabold absolute left-2 bottom-1 z-10">
                      2
                    </p>
                    <Image src={ArcStar} alt="Arc Star" width={40} />
                  </div>
                  <div className="inventoryBox relative">
                    <p className="text-white font-extrabold absolute left-2 bottom-1 z-10">
                      1
                    </p>
                    <Image
                      src={ThermiteGrenade}
                      alt="Thermite Grenade"
                      width={40}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* チーム壊滅 */}
          {displaySettings.teamElimination && (
            <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black px-6 py-4 rounded-lg shadow-lg text-center">
              <div className="text-white text-3xl font-extrabold flex items-center justify-center">
                <p className="text-sm bg-white text-black mr-2 px-2 rounded-md">
                  No.<span className="text-lg">01</span>
                </p>
                <h1>
                  部隊壊滅<span className="mx-2">/</span>Xxxxxxチーム
                </h1>
              </div>
            </div>
          )}
        </div>
        {/* 設定 */}
        <div className="mt-3">
          <div className="text-center mb-4 flex justify-center items-center gap-2">
            <Settings />
            <h1 className="font-extrabold text-xl">画面設定</h1>
          </div>
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="font-medium">スコアバー</span>
              <Switch
                checked={displaySettings.scoreBar}
                onCheckedChange={() => toggleDisplay("scoreBar")}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="font-medium">チーム情報</span>
              <Switch
                checked={displaySettings.teamInfo}
                onCheckedChange={() => toggleDisplay("teamInfo")}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="font-medium">インベントリ</span>
              <Switch
                checked={displaySettings.inventory}
                onCheckedChange={() => toggleDisplay("inventory")}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="font-medium">チーム壊滅表示</span>
              <Switch
                checked={displaySettings.teamElimination}
                onCheckedChange={() => toggleDisplay("teamElimination")}
              />
            </div>
          </div>
        </div>
      </div>
      {/* リザルトオーバーレイ設定 */}
      <div className="mt-15">
        <div className="font-extrabold text-2xl mb-3 flex justify-center items-center gap-3">
          <Table />
          <h1>リザルトオーバーレイ設定</h1>
          <p className="text-sm text-gray-500">必ずパソコンで見てください</p>
        </div>
        {/* プレビュー */}
        <div>
          <Tabs defaultValue="account">
            <TabsList className="mx-auto">
              <TabsTrigger value="total">総合リザルト</TabsTrigger>
              <TabsTrigger value="each_match">各マッチリザルト</TabsTrigger>
              <TabsTrigger value="player">プレイヤーリザルト</TabsTrigger>
              <TabsTrigger value="champions">チャンピオン部隊</TabsTrigger>
            </TabsList>
            <TabsContent value="total">
              <div className="aspect-video w-[70vw] max-h-[82vh] border-2 border-dotted border-gray-500 mx-auto relative overflow-hidden">
                {backgroundImage ? (
                  <Image
                    src={backgroundImage}
                    alt="Background Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Skeleton className="w-full h-full bg-gray-300" />
                )}
                {backgroundImage && (
                  <div className="absolute inset-0 flex items-center justify-center  bg-opacity-50">
                    <div className="text-white text-center bg-gray-500 px-10 py-3">
                      <h2 className="text-2xl font-bold mb-2">
                        ここに合計リザルトが表示されます
                      </h2>
                      <p className="text-sm">背景画像が設定されました</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="each_match">
              <div className="aspect-video w-[70vw] max-h-[82vh] border-2 border-dotted border-gray-500 mx-auto relative overflow-hidden">
                {backgroundImage ? (
                  <Image
                    src={backgroundImage}
                    alt="Background Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Skeleton className="w-full h-full bg-gray-300" />
                )}
                {backgroundImage && (
                  <div className="absolute inset-0 flex items-center justify-center  bg-opacity-50">
                    <div className="text-white text-center bg-gray-500 px-10 py-3">
                      <h2 className="text-2xl font-bold mb-2">
                        ここに各マッチのリザルトが表示されます
                      </h2>
                      <p className="text-sm">背景画像が設定されました</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="player">
              <div className="aspect-video w-[70vw] max-h-[82vh] border-2 border-dotted border-gray-500 mx-auto relative overflow-hidden">
                {backgroundImage ? (
                  <Image
                    src={backgroundImage}
                    alt="Background Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Skeleton className="w-full h-full bg-gray-300" />
                )}
                {backgroundImage && (
                  <div className="absolute inset-0 flex items-center justify-center  bg-opacity-50">
                    <div className="text-white text-center bg-gray-500 px-10 py-3">
                      <h2 className="text-2xl font-bold mb-2">
                        ここにプレイヤーリザルトが表示されます
                      </h2>
                      <p className="text-sm">背景画像が設定されました</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="champions">
              <div className="aspect-video w-[70vw] max-h-[82vh] border-2 border-dotted border-gray-500 mx-auto relative overflow-hidden">
                {backgroundImage ? (
                  <Image
                    src={backgroundImage}
                    alt="Background Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Skeleton className="w-full h-full bg-gray-300" />
                )}
                {backgroundImage && (
                  <div className="absolute inset-0 flex items-center justify-center  bg-opacity-50">
                    <div className="text-white text-center bg-gray-500 px-10 py-3">
                      <h2 className="text-2xl font-bold mb-2">
                        ここにチャンピオン部隊のリザルトが表示されます
                      </h2>
                      <p className="text-sm">背景画像が設定されました</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        {/* 設定 */}
        <div className="max-w-md mx-auto mt-5">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Images className="h-5 w-5" />
              <span className="font-medium">背景画像</span>
            </div>

            {/* ファイルアップロード領域 */}
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                ${
                  isDragOver
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() =>
                document.getElementById("background-file-input")?.click()
              }
            >
              <input
                id="background-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                }}
              />

              {backgroundImage ? (
                <div className="space-y-3">
                  <div className="relative w-32 h-20 mx-auto rounded overflow-hidden">
                    <Image
                      src={backgroundImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        document
                          .getElementById("background-file-input")
                          ?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      変更
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      削除
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      画像をドラッグ&ドロップ
                    </p>
                    <p className="text-xs text-gray-500">
                      またはクリックしてファイルを選択
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF (最大10MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
