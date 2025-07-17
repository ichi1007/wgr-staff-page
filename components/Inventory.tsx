"use client";

import "./inventory.css";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import BackpackImage from "@/public/svg/Backpack_lv1.svg";
import BackpackImageLv2 from "@/public/svg/Backpack_lv2.svg";
import BackpackImageLv3Lv4 from "@/public/svg/Backpack_lv3_lv4.svg";
import KnockdownShieldImage from "@/public/svg/Knockdown_Shield.svg";
import Heat_Shield from "@/public/svg/Heat_Shield.svg";
import Mobile_Respawn_Beacon from "@/public/svg/Mobile_Respawn_Beacon.svg";
import Evac_Tower from "@/public/svg/Evac_Tower.svg";
import Syringe from "@/public/svg/Syringe.svg";
import MedKit from "@/public/svg/Med_Kit.svg";
import ShieldBattery from "@/public/svg/Shield_Battery.svg";
import ShieldCell from "@/public/svg/Shield_Cell.svg";
import PhoenixKit from "@/public/svg/Phoenix_Kit.svg";
import Ultimate_Accelerant from "@/public/svg/Ultimate_Accelerant_white.svg";
import FragGrenade from "@/public/svg/Frag_Grenade.svg";
import ArcStar from "@/public/svg/Arc_Star.svg";
import ThermiteGrenade from "@/public/svg/Thermite_Grenade.svg";

// アイテム名とSVGファイルのマッピング
const itemImageMap: { [key: string]: any } = {
  Backpack: BackpackImage,
  "Backpack (Level 2)": BackpackImageLv2,
  "Backpack (Level 3)": BackpackImageLv3Lv4,
  "Backpack (Level 4)": BackpackImageLv3Lv4,
  "Knockdown Shield": KnockdownShieldImage,
  "Knockdown Shield (Level 2)": KnockdownShieldImage,
  "Knockdown Shield (Level 3)": KnockdownShieldImage,
  "Knockdown Shield (Level 4)": KnockdownShieldImage,
  "Heat Shield": Heat_Shield,
  "Heat Shield (Level 2)": Heat_Shield,
  "Mobile Respawn Beacon": Mobile_Respawn_Beacon,
  "Mobile Respawn Beacon (Level 2)": Mobile_Respawn_Beacon,
  "Evac Tower": Evac_Tower,
  "Evac Tower (Level 2)": Evac_Tower, // レベル付きEvac Towerを追加
  Syringe: Syringe,
  "Med Kit": MedKit,
  "Med Kit (Level 2)": MedKit, // レベル付きMed Kitを追加
  "Shield Battery": ShieldBattery,
  "Shield Battery (Level 2)": ShieldBattery, // レベル付きShield Batteryを追加
  "Shield Cell": ShieldCell,
  "Phoenix Kit": PhoenixKit,
  "Phoenix Kit (Level 3)": PhoenixKit,
  "Frag Grenade": FragGrenade,
  "Arc Star": ArcStar,
  "Thermite Grenade": ThermiteGrenade,
  "Ultimate Accelerant": Ultimate_Accelerant,
  "Ultimate Accelerant (Level 3)": Ultimate_Accelerant, // Ultimate Accelerantの画像を使用
};

// 表示対象のアイテムリスト (グループ化)
const overlayItemGroups = [
  [
    "Backpack (Level 4)",
    "Backpack (Level 3)",
    "Backpack (Level 2)",
    "Backpack",
  ],
  [
    "Knockdown Shield (Level 4)",
    "Knockdown Shield (Level 3)",
    "Knockdown Shield (Level 2)",
    "Knockdown Shield",
  ],
  ["Shield Cell"],
  ["Shield Battery (Level 2)", "Shield Battery"],
  ["Med Kit (Level 2)", "Med Kit"],
  ["Syringe"],
  ["Phoenix Kit (Level 3)", "Phoenix Kit"],
  ["Frag Grenade"],
  ["Arc Star"],
  ["Thermite Grenade"],
  ["Heat Shield (Level 2)", "Heat Shield"],
  ["Mobile Respawn Beacon (Level 2)", "Mobile Respawn Beacon"],
  ["Evac Tower (Level 2)", "Evac Tower"],
  ["Ultimate Accelerant (Level 3)", "Ultimate Accelerant"],
];

const BackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3100/ws";

interface Player {
  name: string;
  inventory: { [key: string]: number };
  // その他のプレイヤー情報
}

interface Players {
  [playerName: string]: Player;
}

// 一番上の行に固定表示するアイテム
const fixedItems = [
  [
    "Backpack (Level 4)",
    "Backpack (Level 3)",
    "Backpack (Level 2)",
    "Backpack",
  ],
  [
    "Knockdown Shield (Level 4)",
    "Knockdown Shield (Level 3)",
    "Knockdown Shield (Level 2)",
    "Knockdown Shield",
  ],
  [
    "Heat Shield (Level 2)",
    "Heat Shield",
    "Evac Tower (Level 2)",
    "Evac Tower",
    "Mobile Respawn Beacon (Level 2)",
    "Mobile Respawn Beacon",
  ], // 優先順位順
  ["Frag Grenade", "Arc Star", "Thermite Grenade"], // 優先順位順
];

// 一番下の行に固定表示するアイテム
const bottomFixedItems = [
  [
    "Backpack (Level 4)",
    "Backpack (Level 3)",
    "Backpack (Level 2)",
    "Backpack",
  ],
  [
    "Knockdown Shield (Level 4)",
    "Knockdown Shield (Level 3)",
    "Knockdown Shield (Level 2)",
    "Knockdown Shield",
  ],
  [
    "Heat Shield (Level 2)",
    "Heat Shield",
    "Evac Tower (Level 2)",
    "Evac Tower",
    "Mobile Respawn Beacon (Level 2)",
    "Mobile Respawn Beacon",
  ], // 優先順位順
  ["Frag Grenade", "Arc Star", "Thermite Grenade"], // 優先順位順
];

// 各行の固定アイテムの定義
const fixedPositions = {
  // 各行の固定位置（0: 左端, 1: 2番目, 2: 3番目, 3: 右端）
  backpack: { row: 0, col: 0 },
  knockdownShield: { row: 0, col: 1 },
  survivalItem: {
    row: 0,
    col: 2,
    items: ["Heat Shield", "Evac Tower", "Mobile Respawn Beacon"],
  },
  grenadeItem: {
    row: 0,
    col: 3,
    items: ["Frag Grenade", "Arc Star", "Thermite Grenade"],
  },
  // 2行目と3行目の右端にもグレネードを配置
  grenadeItem2: {
    row: 1,
    col: 3,
    items: ["Frag Grenade", "Arc Star", "Thermite Grenade"],
  },
  grenadeItem3: {
    row: 2,
    col: 3,
    items: ["Frag Grenade", "Arc Star", "Thermite Grenade"],
  },
};

// 固定アイテムのリスト（グリッドから除外するアイテム）
const fixedItemNames = [
  "Backpack",
  "Backpack (Level 2)",
  "Backpack (Level 3)",
  "Backpack (Level 4)",
  "Knockdown Shield",
  "Knockdown Shield (Level 2)",
  "Knockdown Shield (Level 3)",
  "Knockdown Shield (Level 4)",
  "Heat Shield",
  "Heat Shield (Level 2)",
  "Evac Tower",
  "Evac Tower (Level 2)",
  "Mobile Respawn Beacon",
  "Mobile Respawn Beacon (Level 2)",
  "Frag Grenade",
  "Arc Star",
  "Thermite Grenade",
];

// アイテムのレアリティに応じたフィルターを返す関数
const getItemRarityFilter = (item: string): string | undefined => {
  if (item.startsWith("Backpack") || item.startsWith("Knockdown Shield")) {
    if (item.includes("(Level 4)")) {
      return "drop-shadow(0 0 7px #ffd700)"; // 金
    }
    if (item.includes("(Level 3)")) {
      return "drop-shadow(0 0 7px #a429ff)"; // 紫
    }
    if (item.includes("(Level 2)")) {
      return "drop-shadow(0 0 7px #0070ff)"; // 青
    }
  }
  return undefined; // 白
};

export default function Inventory() {
  const [players, setPlayers] = useState<Players>({});
  const [currentPlayer, setCurrentPlayer] = useState<string>("");
  const observerNameRef = useRef<string>(""); // オブザーバー名を保持するためのref

  // バックエンドAPIからプレイヤー情報を取得
  useEffect(() => {
    // オーバーレイ設定を一度だけ取得してオブザーバー名を設定
    const fetchOverlaySettings = async () => {
      try {
        const response = await fetch("/api/overlay");
        const settings = await response.json();
        if (settings && settings.observerName) {
          observerNameRef.current = settings.observerName;
        }
      } catch (error) {
        console.error("オーバーレイ設定の取得に失敗しました:", error);
      }
    };

    fetchOverlaySettings();

    const fetchPlayers = async () => {
      try {
        const response = await fetch(BackendUrl);
        const data = await response.json();

        if (data && data.players) {
          setPlayers(data.players);
        }

        const configuredObserver = observerNameRef.current;
        const gameObserver = data?.observer;

        if (configuredObserver) {
          // 設定でオブザーバー名が指定されている場合
          if (gameObserver?.observer?.name === configuredObserver) {
            setCurrentPlayer(gameObserver.target?.name || "");
          } else {
            // 指定されたオブザーバーでない場合は表示をクリア
            setCurrentPlayer("");
          }
        } else {
          // 設定がない場合は、任意オブザーバーのターゲットを表示（元の動作）
          if (gameObserver?.target) {
            setCurrentPlayer(gameObserver.target.name);
          }
        }
      } catch (error) {
        console.error("プレイヤー情報の取得に失敗しました:", error);
      }
    };

    // 初回取得
    fetchPlayers();

    // 1秒ごとに更新
    const interval = setInterval(fetchPlayers, 1000);

    return () => clearInterval(interval);
  }, []);

  // 現在のプレイヤーのインベントリを取得
  const currentInventory =
    currentPlayer && players[currentPlayer]
      ? players[currentPlayer].inventory
      : {};

  // 利用可能なグレネードのリスト
  const availableGrenades = [
    "Frag Grenade",
    "Arc Star",
    "Thermite Grenade",
  ].filter((g) => currentInventory[g]);

  // 固定アイテムを取得する関数
  const getFixedItem = (items: string[]): [string, number] | null => {
    for (const item of items) {
      if (currentInventory[item] && currentInventory[item] > 0) {
        return [item, currentInventory[item]];
      }
    }
    return null;
  };

  // オーバーレイ用のアイテムを取得
  const overlayInventory = overlayItemGroups
    .map((itemGroup) => getFixedItem(itemGroup))
    .filter((item): item is [string, number] => !!item);

  // インベントリアイテムを配列に変換してソート
  const inventoryItems = Object.entries(currentInventory)
    .filter(([item, quantity]) => quantity > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  // アイテムを3行に分割（既存のレイアウトに合わせて）
  const getItemsForRow = (rowIndex: number): Array<[string, number]> => {
    const itemsPerRow = 4;
    const startIndex = rowIndex * itemsPerRow;
    return inventoryItems.slice(startIndex, startIndex + itemsPerRow);
  };

  // 固定アイテムを除いた拾ったアイテムのリスト
  const pickedItems = Object.entries(currentInventory)
    .filter(
      ([item, quantity]) =>
        quantity > 0 && !fixedItemNames.includes(item) && itemImageMap[item] // 画像が定義されているアイテムのみ
    )
    .sort(([a], [b]) => a.localeCompare(b));

  // 各行のアイテムを取得する関数
  const getItemsForGridRow = (
    rowIndex: number
  ): Array<[string, number] | null> => {
    const row = new Array(4).fill(null);

    // 固定アイテムを配置
    if (rowIndex === 0) {
      // 1行目: Backpack, Knockdown Shield, Survival Item, Grenade
      row[0] = getFixedItem([
        "Backpack (Level 4)",
        "Backpack (Level 3)",
        "Backpack (Level 2)",
        "Backpack",
      ]);
      row[1] = getFixedItem([
        "Knockdown Shield (Level 4)",
        "Knockdown Shield (Level 3)",
        "Knockdown Shield (Level 2)",
        "Knockdown Shield",
      ]);
      row[2] = getFixedItem([
        "Heat Shield (Level 2)",
        "Heat Shield",
        "Evac Tower (Level 2)",
        "Evac Tower",
        "Mobile Respawn Beacon (Level 2)",
        "Mobile Respawn Beacon",
      ]);
      if (availableGrenades.length > 0) {
        const grenade = availableGrenades[0];
        row[3] = [grenade, currentInventory[grenade]];
      } else {
        row[3] = null;
      }
    } else {
      // 2行目以降: 拾ったアイテム + 右端にグレネード
      const startIndex = (rowIndex - 1) * 3;
      for (let i = 0; i < 3; i++) {
        if (startIndex + i < pickedItems.length) {
          row[i] = pickedItems[startIndex + i];
        }
      }
      // 各行で異なるグレネードを表示
      if (availableGrenades.length > rowIndex) {
        const grenade = availableGrenades[rowIndex];
        row[3] = [grenade, currentInventory[grenade]];
      } else {
        row[3] = null;
      }
    }

    return row;
  };

  const renderInventoryBox = (item: string, quantity: number) => {
    const image = itemImageMap[item];
    const filter = getItemRarityFilter(item);

    if (!image) {
      return null; // 対応する画像がない場合は表示しない
    }

    return (
      <div key={item} className="inventoryBox relative">
        <p className="text-white font-extrabold absolute left-3 bottom-2 z-10">
          {quantity}
        </p>
        <Image
          src={image}
          alt={item}
          width={
            item.startsWith("Med Kit") ||
            item.startsWith("Shield Battery") ||
            item.startsWith("Phoenix Kit") ||
            item.startsWith("Arc Star") ||
            item.startsWith("Heat Shield")
              ? 45
              : 40
          }
          style={filter ? { filter } : {}}
        />
      </div>
    );
  };

  const renderOverlayItem = (item: string, quantity: number) => {
    const image = itemImageMap[item];
    if (!image) return null;

    return (
      <div key={item} className="overlayItem flex items-center mb-2">
        <Image src={image} alt={item} width={40} height={40} />
        <p className="text-white font-bold ml-2">{quantity}</p>
      </div>
    );
  };

  const renderFixedItem = (
    item: string | string[],
    currentInventory: { [key: string]: number }
  ) => {
    let selectedItem = "";
    let quantity = 0;

    if (Array.isArray(item)) {
      // 優先順位順にアイテムを選択
      for (const candidate of item) {
        if (currentInventory[candidate]) {
          selectedItem = candidate;
          quantity = currentInventory[candidate];
          break;
        }
      }
    } else {
      selectedItem = item;
      quantity = currentInventory[item] || 0;
    }

    if (!selectedItem || quantity === 0)
      return <div className="inventoryBox relative"></div>;

    const image = itemImageMap[selectedItem];
    if (!image) return null;

    return (
      <div key={selectedItem} className="inventoryBox relative">
        <p className="text-white font-extrabold absolute left-3 bottom-2 z-10">
          {quantity}
        </p>
        <Image src={image} alt={selectedItem} width={40} height={40} />
      </div>
    );
  };

  return (
    <div className="inventory w-[1920px] h-[1080px] relative">
      {/* グリッドレイアウト */}
      <div className="absolute bottom-11 right-93 flex flex-col-reverse">
        {[0, 1, 2].map((rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className={`flex ${
              rowIndex === 1 ? "ml-8" : rowIndex === 2 ? "ml-16" : ""
            }`}
          >
            {getItemsForGridRow(rowIndex).map((itemData, colIndex) =>
              itemData ? (
                renderInventoryBox(itemData[0], itemData[1])
              ) : (
                <div
                  key={`empty-${rowIndex}-${colIndex}`}
                  className="inventoryBox relative"
                ></div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
