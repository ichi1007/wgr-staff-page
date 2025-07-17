"use client";
import dynamic from "next/dynamic";
const Inventory = dynamic(() => import("./Inventory"), { ssr: false });

export default function InventoryClient() {
  return <Inventory />;
}
