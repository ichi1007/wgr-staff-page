"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const legends = [
  { name: "Ash", ref: "ash" },
  { name: "Lifeline", ref: "lifeline" },
  { name: "Octane", ref: "octane" },
  { name: "Ballistic", ref: "ballistic" },
  { name: "Pathfinder", ref: "pathfinder" },
  { name: "Wraith", ref: "wraith" },
  { name: "Mad Maggie", ref: "madmaggie" },
  { name: "Loba", ref: "loba" },
  { name: "Bangalore", ref: "bangalore" },
  { name: "Horizon", ref: "horizon" },
  { name: "Mirage", ref: "mirage" },
  { name: "Alter", ref: "alter" },
  { name: "Revenant", ref: "revenant" },
  { name: "Fuse", ref: "fuse" },
  { name: "Bloodhound", ref: "bloodhound" },
  { name: "Valkyrie", ref: "valkyrie" },
  { name: "Newcastle", ref: "newcastle" },
  { name: "Conduit", ref: "conduit" },
  { name: "Vantage", ref: "vantage" },
  { name: "Rampart", ref: "rampart" },
  { name: "Crypto", ref: "crypto" },
  { name: "Wattson", ref: "wattson" },
  { name: "Gibraltar", ref: "gibraltar" },
  { name: "Catalyst", ref: "catalyst" },
  { name: "Caustic", ref: "caustic" },
  { name: "Seer", ref: "seer" },
  { name: "Sparrow", ref: "sparrow" },
].sort((a, b) => a.name.localeCompare(b.name));

type Team = { id: number; name?: string; spawnPoint?: number };

export default function LiveControlPageComp() {
  // 状態管理
  const [wsToken, setWsToken] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [log, setLog] = useState<{ msg: string; type: string }[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [previousTeams, setPreviousTeams] = useState<
    Record<number, { name: string | null; spawnPoint: number | null }>
  >({});
  const [teamId, setTeamId] = useState("2");
  const [teamName, setTeamName] = useState("");
  const [spawnPoint, setSpawnPoint] = useState("");
  const [bannedLegends, setBannedLegends] = useState<string[]>([]);
  const [legendModalOpen, setLegendModalOpen] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  // ログ追加
  const addLog = (msg: string, type: string = "info") => {
    setLog((prev) => [...prev, { msg, type }]);
  };

  // 接続状態更新
  const updateConnectionStatus = (connected: boolean) => {
    setIsConnected(connected);
  };

  // WebSocket接続
  const connect = () => {
    if (!wsToken.trim()) {
      addLog("WebSocketトークンを入力してください", "error");
      return;
    }
    if (wsRef.current) wsRef.current.close();

    addLog("WebSocketに接続中...");
    const ws = new WebSocket(
      `wss://dgs-ws-lb.apexlegendsstatus.com:8443/?token=${wsToken}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      addLog("WebSocket接続成功");
      updateConnectionStatus(true);
      sendMessage('{"ALSClientType":"web"}');
      sendMessage('{"query":"SYS_getClients"}');
    };
    ws.onmessage = (event) => {
      addLog(`受信: ${event.data}`, "received");
      try {
        const data = JSON.parse(event.data);
        handleMessage(data);
      } catch (e: any) {
        addLog(`JSONパースエラー: ${e.message}`, "error");
      }
    };
    ws.onclose = () => {
      addLog("WebSocket接続が閉じられました");
      updateConnectionStatus(false);
    };
    ws.onerror = (error) => {
      addLog(`WebSocketエラー: ${String(error)}`, "error");
    };
  };

  // メッセージ送信
  const sendMessage = (msg: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(msg);
      addLog(`送信: ${msg}`, "sent");
    } else {
      addLog("WebSocketが接続されていません", "error");
    }
  };

  // メッセージ処理
  const handleMessage = (data: any) => {
    if (data.teams) {
      checkTeamChanges(data.teams);
      setTeams(data.teams);
    }
    if (data.hasOwnProperty("legends")) {
      const bans: string[] = [];
      data.legends.forEach((l: any) => {
        if (l.banned) bans.push(l.reference);
      });
      setBannedLegends(bans);
      addLog(`レジェンドバン状態を更新: ${bans.length}体がバン中`, "received");
    }
  };

  // チーム変更検知
  const checkTeamChanges = (currentTeams: Team[]) => {
    const prev = { ...previousTeams };
    currentTeams.forEach((team) => {
      if (team.id > 1) {
        const teamId = team.id;
        const current = {
          name: team.name || null,
          spawnPoint: team.spawnPoint || null,
        };
        if (prev[teamId]) {
          if (prev[teamId].name !== current.name) {
            addLog(
              `Team ${teamId} 名前変更: "${prev[teamId].name || "なし"}" → "${
                current.name || "なし"
              }"`,
              "change"
            );
          }
          if (prev[teamId].spawnPoint !== current.spawnPoint) {
            addLog(
              `Team ${teamId} スポーンポイント変更: ${
                prev[teamId].spawnPoint || "なし"
              } → ${current.spawnPoint || "なし"}`,
              "change"
            );
          }
        } else {
          if (current.name || current.spawnPoint) {
            addLog(
              `Team ${teamId} 初期設定: 名前="${
                current.name || "なし"
              }", スポーン=${current.spawnPoint || "なし"}`,
              "init"
            );
          }
        }
        prev[teamId] = { ...current };
      }
    });
    setPreviousTeams(prev);
  };

  // チーム名更新
  const updateTeamName = (teamId: number, newName: string) => {
    if (newName.trim()) {
      sendMessage(
        JSON.stringify({
          query: "BGC_query",
          qt: "setTeamName",
          teamId,
          teamName: newName,
        })
      );
    }
  };

  // スポーンポイント更新
  const updateSpawnPoint = (teamId: number, spawn: string) => {
    if (spawn) {
      sendMessage(
        JSON.stringify({
          query: "BGC_query",
          qt: "setSpawnPoint",
          teamId,
          spawnPoint: parseInt(spawn),
        })
      );
    }
  };

  // レジェンド画像URL
  const getLegendImageUrl = (legendName: string) =>
    legendName === "Mad Maggie"
      ? "https://apexlegendsstatus.com/assets/legends/humanesas/Mad-maggie.webp"
      : `https://apexlegendsstatus.com/assets/legends/humanesas/${legendName}.webp`;

  // レジェンドバン切り替え
  const toggleLegendBan = (legend: { name: string; ref: string }) => {
    setBannedLegends((prev) => {
      if (prev.includes(legend.ref)) {
        addLog(`${legend.name} をバンリストから削除`, "change");
        return prev.filter((r) => r !== legend.ref);
      } else {
        addLog(`${legend.name} をバンリストに追加`, "change");
        return [...prev, legend.ref];
      }
    });
  };

  // レジェンドバン適用
  const applyLegendBans = () => {
    sendMessage(
      JSON.stringify({
        query: "BGC_query",
        qt: "setLegendBan",
        legendRefs: bannedLegends,
      })
    );
    addLog(`レジェンドバンを適用: [${bannedLegends.join(", ")}]`, "change");
    setLegendModalOpen(false);
  };

  // 現在のバン取得
  const fetchCurrentBans = () => {
    sendMessage(
      JSON.stringify({
        query: "BGC_query",
        qt: "getLegendBanStatus",
      })
    );
  };

  // 初期化
  useEffect(() => {
    setIsConnected(false);
    addLog("ページが読み込まれました");
    // eslint-disable-next-line
  }, []);

  // ログ色
  const logColor = (type: string) =>
    type === "sent"
      ? "text-green-400"
      : type === "received"
      ? "text-cyan-400"
      : type === "change"
      ? "text-yellow-400"
      : type === "init"
      ? "text-teal-400"
      : type === "error"
      ? "text-red-400"
      : "text-white";

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 text-white">
      <h1 className="text-2xl font-bold mb-2">WebSocket チーム名変更テスト</h1>

      {/* 接続状況 */}
      <section className="bg-zinc-800 rounded-lg p-4 space-y-2">
        <h2 className="font-bold">接続状況</h2>
        <div
          className={clsx(
            "rounded px-3 py-2 mb-2",
            isConnected
              ? "bg-green-900 border border-green-500"
              : "bg-red-900 border border-red-500"
          )}
        >
          {isConnected ? "接続中" : "切断中"}
        </div>
        <div className="flex gap-2 items-center">
          <Input
            className="flex-1"
            placeholder="WebSocketトークンを入力してください"
            value={wsToken}
            onChange={(e) => setWsToken(e.target.value)}
            disabled={isConnected}
          />
          <Button onClick={connect} disabled={isConnected}>
            接続
          </Button>
          <Button
            variant="secondary"
            onClick={() => wsRef.current?.close()}
            disabled={!isConnected}
          >
            切断
          </Button>
        </div>
      </section>

      {/* チーム一覧 */}
      <section className="bg-zinc-800 rounded-lg p-4 space-y-2">
        <h2 className="font-bold">現在のチーム一覧</h2>
        <Button
          onClick={() =>
            sendMessage('{"query":"BGC_query", "qt":"getLobbyPlayers"}')
          }
          disabled={!isConnected}
        >
          チーム情報取得
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {teams
            .filter((t) => t.id > 1)
            .map((team) => (
              <div key={team.id} className="bg-zinc-700 rounded p-3 space-y-1">
                <div className="font-bold">Team {team.id}</div>
                <div>名前: {team.name || "なし"}</div>
                <div>スポーン: {team.spawnPoint || "なし"}</div>
                <div className="flex gap-2 mt-1">
                  <Input
                    className="flex-1"
                    placeholder="新しい名前"
                    defaultValue={team.name || ""}
                    onBlur={(e) => updateTeamName(team.id, e.target.value)}
                    disabled={!isConnected}
                  />
                  <select
                    className="bg-zinc-600 rounded p-1"
                    defaultValue={team.spawnPoint || ""}
                    onBlur={(e) => updateSpawnPoint(team.id, e.target.value)}
                    disabled={!isConnected}
                  >
                    <option value="">スポーンポイント選択</option>
                    {Array.from({ length: 25 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        スポーンポイント {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 通信ログ */}
      <section className="bg-zinc-800 rounded-lg p-4 space-y-2">
        <h2 className="font-bold">通信ログ</h2>
        <Button onClick={() => setLog([])}>ログクリア</Button>
        <div className="bg-zinc-900 rounded p-2 mt-2 h-48 overflow-y-auto font-mono text-xs">
          {log.map((l, i) => (
            <div key={i} className={logColor(l.type)}>
              [{new Date().toLocaleTimeString()}] {l.type.toUpperCase()}:{" "}
              {l.msg}
            </div>
          ))}
        </div>
      </section>

      {/* レジェンドバン */}
      <section className="bg-zinc-800 rounded-lg p-4 space-y-2">
        <h2 className="font-bold">レジェンドバン</h2>
        <Button
          onClick={() => {
            setLegendModalOpen(true);
            fetchCurrentBans();
          }}
          disabled={!isConnected}
        >
          レジェンドバン設定
        </Button>
        <div className="mt-2 min-h-[30px]">
          <strong>現在のバン:</strong>{" "}
          {bannedLegends.length === 0
            ? "なし"
            : legends
                .filter((l) => bannedLegends.includes(l.ref))
                .map((l) => l.name)
                .join(", ")}
        </div>
      </section>

      {/* レジェンドバンモーダル */}
      <AnimatePresence>
        {legendModalOpen && (
          <Dialog open={legendModalOpen} onOpenChange={setLegendModalOpen}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>レジェンドバン設定</DialogTitle>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex gap-2 mb-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setBannedLegends([]);
                      addLog("全てのレジェンドバンをクリア", "change");
                    }}
                  >
                    全てクリア
                  </Button>
                  <Button onClick={fetchCurrentBans}>現在のバン取得</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {legends.map((legend) => {
                    const isBanned = bannedLegends.includes(legend.ref);
                    return (
                      <div
                        key={legend.ref}
                        className={clsx(
                          "rounded-lg p-2 text-center cursor-pointer border-2 transition-all",
                          isBanned
                            ? "border-red-500 bg-red-900"
                            : "border-zinc-600 bg-zinc-700",
                          !isBanned && "hover:bg-zinc-600"
                        )}
                        onClick={() => toggleLegendBan(legend)}
                      >
                        <img
                          src={getLegendImageUrl(legend.name)}
                          alt={legend.name}
                          className={clsx(
                            "mx-auto rounded-full object-cover object-top",
                            isBanned && "grayscale"
                          )}
                          style={{ width: 48, height: 48 }}
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                        <div
                          className={clsx(
                            "mt-1 text-xs",
                            isBanned
                              ? "line-through text-red-400"
                              : "text-white"
                          )}
                        >
                          {legend.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center mt-4">
                  <Button
                    onClick={applyLegendBans}
                    className="bg-green-700 hover:bg-green-800"
                  >
                    バンを適用
                  </Button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
