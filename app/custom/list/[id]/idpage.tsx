"use client";
import { useParams } from "next/navigation";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Plus,
  Trash2,
  ChevronDown,
  Share,
  Images,
  FileText,
  Loader2,
  LogOut,
  User,
  ExternalLink,
  LoaderCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import conversionDataRaw from "@/components/Conversion.json";
import Image from "next/image";
import GoogleLogo from "@/public/svg/Google__G__logo.svg";
import GoogleDriveSelector from "@/components/GoogleDriveSelector";
import { Textarea } from "@/components/ui/textarea"; // Textarea コンポーネントをインポート
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Tooltip コンポーネントをインポート

// Conversion.jsonの型を定義
interface ConversionData {
  map: Record<string, string>;
}

const conversionData: ConversionData = conversionDataRaw;

// プレイヤーの型を定義変換
interface PlayerResult {
  nidHash: string;
  kills: number;
  playerName: string;
  teamName: string;
  hits: number;
  headshots: number;
  knockdowns: number;
  revivesGiven: number;
  respawnsGiven: number;
  survivalTime: number;
  assists: number;
  damageDealt: number;
  teamPlacement: number;
  hardware: string;
  teamNum: number;
  characterName: string;
  shots: number;
}

interface TeamResult {
  id: string;
  name: string;
  placement: number;
  placementPoint: number;
  killPoint: number;
  allPoint: number;
  matchPoint: boolean; // matchPointフィールドを追加
  winner: boolean; // winnerフィールドを追加
}

interface Match {
  id: string;
  match_start: number;
  map_name: string;
  mapName: string; // APIから取得するマップ名
  matchStart: string; // APIから取得する開始時刻
  player_results: PlayerResult[];
  teamResult: TeamResult[];
  createdAt: string; // CustomDataにcreatedAtフィールドを追加
}

export default function CustomIdPageComp() {
  const id = useParams().id;
  const router = useRouter();
  const [customName, setCustomName] = useState("");
  const [pointRule, setPointRule] = useState("");
  const [algsRankPoints, setAlgsRankPoints] = useState<number[]>(
    Array(20).fill(0)
  );
  const [dialogStep, setDialogStep] = useState(1);
  const [killPoint, setKillPoint] = useState(1);
  const [polandKillPointLimit, setPolandKillPointLimit] = useState<
    number | null
  >(null); // Poland Ruleキルポイント上限のstateを追加
  const [statsCode, setStatsCode] = useState("");
  const [matchData, setMatchData] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false); // statsCode取得用
  const [hasFetched, setHasFetched] = useState(false); // statsCode取得結果判定用
  const [savedMatches, setSavedMatches] = useState<Match[]>([]);
  const [totalResults, setTotalResults] = useState<
    {
      name: string;
      totalPlacementPoint: number;
      totalKillPoint: number;
      totalAllPoint: number;
      matchCount: number;
      isOverallWinner: boolean; // 全体での勝者フラグを追加
      isMatchPoint: boolean; // マッチポイントフラグを追加
    }[]
  >([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [matchPoint, setMatchPoint] = useState<number | null>(null); // matchPointを追加
  const [isGoogleDialogOpen, setIsGoogleDialogOpen] = useState(false); // Google Dialogのステートを追加
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(
    null
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログイン状態を管理
  const [googleAccount, setGoogleAccount] = useState<any | null>(null); // Googleアカウント情報
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [sheetTitle, setSheetTitle] = useState("");
  const [existingSheetId, setExistingSheetId] = useState<string | null>(null);
  const [existingSheetUrl, setExistingSheetUrl] = useState<string | null>(null);
  const [defaultTeams, setDefaultTeams] = useState<string[]>([]); // defaultTeams stateを追加
  const [defaultTeamsInput, setDefaultTeamsInput] = useState(""); // デフォルトチーム設定用テキストエリアのstateを追加
  const [isSavingDefaultTeams, setIsSavingDefaultTeams] = useState(false); // デフォルトチーム保存用ローディング
  const [activeTab, setActiveTab] = useState("total"); // タブの状態を管理するstateを追加
  const [isPageLoading, setIsPageLoading] = useState(true); // ページ全体のローディング状態を追加

  // 保存されたマッチデータを取得
  const fetchSavedMatches = useCallback(async () => {
    try {
      // APIから古い順でデータが取得されるようになる
      const response = await axios.get(`/api/customs/${id}/matches`);
      const matches = response.data;
      setSavedMatches(matches);

      // 合計結果を計算
      calculateTotalResults(matches);
    } catch (error) {
      console.error("Error fetching saved matches:", error);
      setSavedMatches([]); // エラー時も空配列で状態を更新
      setTotalResults([]); // エラー時も空配列で状態を更新
    }
  }, [id]);

  useEffect(() => {
    async function fetchInitialData() {
      setIsPageLoading(true); // ページロード開始時にローディングをtrueに

      try {
        // カスタム設定データを取得
        const customResponse = await axios.get(`/api/customs/${id}`);
        const customData = customResponse.data;
        setCustomName(customData.customName);

        // ポイントルールを判定
        if (customData.algs) {
          setPointRule("ALGS");
        } else if (customData.polandRule) {
          setPointRule("Poland Rule");
        } else if (customData.teamDeathMatch) {
          setPointRule("Team Death Match");
        } else {
          setPointRule("Unknown");
        }

        // 設定済みのキルポイントを設定
        if (customData.killPoint) {
          setKillPoint(customData.killPoint);
        }

        // matchPointを設定
        if (
          customData.matchPoint !== null &&
          customData.matchPoint !== undefined
        ) {
          setMatchPoint(customData.matchPoint);
        }

        // Poland Ruleキルポイント上限を設定
        if (
          customData.polandkillPointLimit !== null &&
          customData.polandkillPointLimit !== undefined
        ) {
          setPolandKillPointLimit(customData.polandkillPointLimit);
        } else {
          // デフォルト値として9999を設定
          setPolandKillPointLimit(9999);
        }

        // 設定済みのプレースメントポイントを設定
        if (customData.placementPoint) {
          const placementPoints = [
            customData.placementPoint.place1,
            customData.placementPoint.place2,
            customData.placementPoint.place3,
            customData.placementPoint.place4,
            customData.placementPoint.place5,
            customData.placementPoint.place6,
            customData.placementPoint.place7,
            customData.placementPoint.place8,
            customData.placementPoint.place9,
            customData.placementPoint.place10,
            customData.placementPoint.place11,
            customData.placementPoint.place12,
            customData.placementPoint.place13,
            customData.placementPoint.place14,
            customData.placementPoint.place15,
            customData.placementPoint.place16,
            customData.placementPoint.place17,
            customData.placementPoint.place18,
            customData.placementPoint.place19,
            customData.placementPoint.place20,
          ];
          setAlgsRankPoints(placementPoints);
        }

        // デフォルトチームを設定し、テキストエリアのstateにもセット
        if (customData.defaultTeams && Array.isArray(customData.defaultTeams)) {
          setDefaultTeams(customData.defaultTeams);
          setDefaultTeamsInput(customData.defaultTeams.join("\n")); // テキストエリア用に改行区切りでセット
        } else {
          setDefaultTeams([]);
          setDefaultTeamsInput("");
        }

        // 既存のスプレッドシート情報をセット
        if (customData.spreadsheetId && customData.spreadsheetUrl) {
          setExistingSheetId(customData.spreadsheetId);
          setExistingSheetUrl(customData.spreadsheetUrl);
        }

        // マッチデータを取得
        await fetchSavedMatches();
      } catch (error) {
        console.error("Error fetching initial custom data:", error);
        // エラー時もローディングを終了
      } finally {
        setIsPageLoading(false); // 全ての初期データ取得後にローディングをfalseに
      }
    }
    fetchInitialData();
  }, [id, fetchSavedMatches]); // fetchSavedMatchesを依存配列に追加

  // 合計結果を計算
  const calculateTotalResults = (matches: Match[]) => {
    const teamTotals = new Map<
      string,
      {
        name: string;
        totalPlacementPoint: number;
        totalKillPoint: number;
        totalAllPoint: number;
        matchCount: number;
        isOverallWinner: boolean; // 全体での勝者フラグ
        isMatchPoint: boolean; // マッチポイントフラグを追加
      }
    >();

    matches.forEach((match) => {
      match.teamResult.forEach((team) => {
        if (!teamTotals.has(team.name)) {
          teamTotals.set(team.name, {
            name: team.name,
            totalPlacementPoint: 0,
            totalKillPoint: 0,
            totalAllPoint: 0,
            matchCount: 0,
            isOverallWinner: false, // 初期値
            isMatchPoint: false, // 初期値を追加
          });
        }

        const teamData = teamTotals.get(team.name);
        if (teamData) {
          teamData.totalPlacementPoint += team.placementPoint;
          teamData.totalKillPoint += team.killPoint;
          teamData.totalAllPoint += team.allPoint;
          teamData.matchCount += 1;
          // どの試合かでwinnerフラグが立っていれば、全体フラグも立てる
          if (team.winner) {
            teamData.isOverallWinner = true;
          }
          // どの試合かでmatchPointフラグが立っていれば、全体フラグも立てる
          if (team.matchPoint) {
            teamData.isMatchPoint = true;
          }
        }
      });
    });

    // ソートロジックを修正: isOverallWinnerがtrueのチームを最優先
    const sortedResults = Array.from(teamTotals.values()).sort((a, b) => {
      // isOverallWinnerがtrueのチームを優先 (true > false)
      if (b.isOverallWinner !== a.isOverallWinner) {
        return b.isOverallWinner ? 1 : -1; // bがtrueならbが上, aがtrueならaが上
      }

      // isOverallWinnerが同じ場合 (両方trueまたは両方false) は、既存のポイント順でソート
      if (b.totalAllPoint !== a.totalAllPoint) {
        return b.totalAllPoint - a.totalAllPoint; // 合計ポイント降順
      }
      return b.totalPlacementPoint - a.totalPlacementPoint; // 順位ポイント降順
    });

    setTotalResults(sortedResults);
  };

  // useEffect(() => { // fetchInitialDataに統合したため削除
  //   fetchSavedMatches();
  // }, [fetchSavedMatches]); // fetchSavedMatchesはuseCallbackでラップ済み

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/customs/${id}`);
      router.push("/custom/list"); // 削除後にリストページへリダイレクト
    } catch (error) {
      console.error("Error deleting custom:", error);
    }
  };

  const handleNextStep = () => {
    setDialogStep(2);
  };

  const handleBackStep = () => {
    setDialogStep(1);
    setStatsCode("");
    setMatchData([]); // ダイアログを閉じるときに取得したマッチデータもクリア
    setHasFetched(false); // 取得済みフラグもリセット
    // Poland Ruleキルポイント上限の入力値をリセットしない（設定値として保持）
  };

  const handleDialogClose = () => {
    setDialogStep(1);
    setStatsCode("");
    setMatchData([]); // ダイアログを閉じるときに取得したマッチデータもクリア
    setHasFetched(false); // 取得済みフラグもリセット
    setIsDialogOpen(false); // Dialogを閉じる
    // Poland Ruleキルポイント上限の入力値をリセットしない（設定値として保持）
  };

  const handleFetchMatchData = async () => {
    if (!statsCode.trim()) return;

    try {
      setIsLoading(true); // statsCode取得用ローディング
      setHasFetched(false); // 取得開始時にリセット
      const response = await axios.get(`/api/match/${statsCode}`);
      setMatchData(response.data.matches || []);
      setHasFetched(true); // データ取得済みに設定
    } catch (error) {
      console.error("Error fetching match data:", error);
      setMatchData([]);
      setHasFetched(true); // データ取得済みに設定
    } finally {
      setIsLoading(false); // statsCode取得用ローディング終了
    }
  };

  const handleSelectMatch = async (match: Match) => {
    try {
      setIsLoading(true); // マッチ保存用ローディング

      // 送信するポイント設定値をログ出力（デバッグ用）
      console.log("Sending points to API:", {
        killPoint: killPoint,
        placementPoint: algsRankPoints,
        killPointLimit: polandKillPointLimit,
      });

      // マッチデータをDBに保存
      // 現在のポイント設定値をリクエストボディに含める
      const response = await axios.post(`/api/customs/${id}/match`, {
        matchData: match,
        killPoint: killPoint, // 現在のキルポイントを送信
        placementPoint: algsRankPoints, // 現在の順位ポイント配列を送信
        killPointLimit: polandKillPointLimit, // 現在のPoland Ruleキルポイント上限を送信
      });

      if (response.data.success) {
        console.log("Match saved successfully:", response.data);

        // 最新データを再取得 (古い順で取得される)
        await fetchSavedMatches();

        // Dialogを閉じる
        handleDialogClose();
      }
    } catch (error) {
      console.error("Error saving match:", error);
      alert("マッチデータの保存に失敗しました");
    } finally {
      setIsLoading(false); // マッチ保存用ローディング終了
    }
  };

  // マップ名を取得する関数
  const getMapName = (mapKey: string): string => {
    // Conversion.jsonのデータを使用してマップ名を取得
    return conversionData.map[mapKey] || "マップ不明";
  };

  // マッチを削除する関数
  const handleDeleteMatch = async (matchId: string) => {
    try {
      setIsLoading(true); // ローディング開始

      // マッチデータを削除
      const response = await axios.delete(
        `/api/customs/${id}/matches/${matchId}`
      );
      if (response.status === 200) {
        console.log("Match deleted successfully:", response.data);

        // 最新データを再取得
        await fetchSavedMatches();

        // 削除後にTotalタブに戻る
        setActiveTab("total");
      }
    } catch (error) {
      console.error("Error deleting match:", error);
      alert("マッチデータの削除に失敗しました");
    } finally {
      setIsLoading(false); // ローディング終了
    }
  };

  const handleGoogleLogin = () => {
    const width = 600;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const loginWindow = window.open(
      "/api/google",
      "GoogleLogin",
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
    );

    // メッセージを受け取るリスナーを追加
    window.addEventListener("message", async (event) => {
      if (event.data?.type === "google-auth-success") {
        setIsLoggedIn(true); // ログイン状態を更新
        setGoogleAccessToken(event.data.accessToken);

        // 必要に応じてGoogleアカウント情報を取得
        try {
          const response = await axios.get("/api/google/account", {
            headers: {
              Authorization: `Bearer ${event.data.accessToken}`,
            },
          });
          setGoogleAccount(response.data);
        } catch (error) {
          console.error("Googleアカウント情報の取得に失敗しました:", error);
        }
      }
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false); // ログアウト状態に更新
    setGoogleAccount(null); // アカウント情報をクリア
    setGoogleAccessToken(null); // アクセストークンをクリア
  };

  const handleCreateGoogleSheet = async () => {
    if (!googleAccount?.email) {
      alert("Googleアカウントにログインしてください");
      return;
    }

    if (!sheetTitle.trim()) {
      alert("スプレッドシートのタイトルを入力してください");
      return;
    }

    setIsCreatingSheet(true);
    try {
      // スプレッドシートを作成
      const createResponse = await axios.post(
        "/api/google/sheets/create",
        {
          title: sheetTitle,
          parentFolderId: selectedFolderId === "root" ? null : selectedFolderId,
          userEmail: googleAccount.email, // この情報はサーバー側でユーザー認証から取得する方が安全だが、今回はそのまま使用
        },
        {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`, // ユーザーのアクセストークンをヘッダーに追加
          },
        }
      );

      const { spreadsheetId, url } = createResponse.data;

      // データを書き込み
      // 書き込みはサービスアカウントで行うため、Authorizationヘッダーは不要
      await axios.post("/api/google/sheets/write", {
        spreadsheetId,
        totalResults, // totalResultsにはisOverallWinnerが含まれている
        matches: savedMatches, // savedMatchesは古い順になっている
        customName,
      });

      // DBにスプレッドシート情報を保存
      await axios.post(`/api/customs/${id}/sheets`, {
        spreadsheetId,
        url,
      });

      setExistingSheetId(spreadsheetId);
      setExistingSheetUrl(url);
      setIsGoogleDialogOpen(false);
      setSheetTitle("");
      setSelectedFolderId(null);

      alert("スプレッドシートが正常に作成されました！");
    } catch (error: any) {
      console.error(
        "スプレッドシート作成エラー:",
        error.response?.data || error
      );

      if (error.response?.status === 403) {
        const details = error.response?.data?.details || error.message;
        const suggestions = error.response?.data?.suggestions || [
          "Googleアカウントが正しいか確認してください。",
          "必要なスコープが付与されているか確認してください。",
          "フォルダの権限が適切に設定されているか確認してください。",
        ];
        alert(
          "スプレッドシートの作成に失敗しました。\n" +
            "権限が不足している可能性があります。\n" +
            suggestions.map((s: string) => `- ${s}`).join("\n") +
            "\n詳細: " +
            details
        );
      } else if (error.response?.status === 500) {
        alert(
          "サーバーエラーが発生しました。\n" +
            "管理者にお問い合わせください。\n" +
            "詳細: " +
            (error.response?.data?.details || error.message)
        );
      } else {
        alert(
          "スプレッドシートの作成に失敗しました。\n" +
            "詳細: " +
            (error.response?.data?.details || error.message)
        );
      }
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleUpdateGoogleSheet = async () => {
    if (!existingSheetId) return;

    setIsCreatingSheet(true);
    try {
      await axios.post("/api/google/sheets/write", {
        spreadsheetId: existingSheetId,
        totalResults, // totalResultsにはisOverallWinnerが含まれている
        matches: savedMatches, // savedMatchesは古い順になっている
        customName,
      });

      alert("スプレッドシートが正常に更新されました！");
    } catch (error) {
      console.error("スプレッドシート更新エラー:", error);
      alert("スプレッドシートの更新に失敗しました");
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // スプレッドシート連携を解除する関数
  const handleUnlinkGoogleSheet = async () => {
    if (!existingSheetId) return;

    try {
      setIsLoading(true); // ローディング開始
      const response = await axios.post(`/api/customs/${id}/sheets/unlink`);

      if (response.data.success) {
        console.log("Google Sheet unlinked successfully.");
        setExistingSheetId(null); // 状態をリセット
        setExistingSheetUrl(null);
        alert("スプレッドシート連携を解除しました。");
        setIsGoogleDialogOpen(false); // ダイアログを閉じる
      } else {
        alert("スプレッドシート連携の解除に失敗しました。");
      }
    } catch (error) {
      console.error("Error unlinking Google Sheet:", error);
      alert("スプレッドシート連携の解除中にエラーが発生しました。");
    } finally {
      setIsLoading(false); // ローディング終了
    }
  };

  // テキストエリアの入力文字列をチーム名の配列にパースする関数
  const parseDefaultTeamsInput = (input: string): string[] => {
    // 改行またはカンマ、読点で分割し、空文字列や空白のみの文字列を除去
    const teams = input
      .split(/[\n,、]/)
      .map((team) => team.trim())
      .filter((team) => team !== "");
    return teams;
  };

  // デフォルトチームを保存する関数
  const handleSaveDefaultTeams = async () => {
    setIsSavingDefaultTeams(true);
    try {
      const parsedTeams = parseDefaultTeamsInput(defaultTeamsInput);

      const response = await axios.post(`/api/customs/${id}/default-teams`, {
        defaultTeams: parsedTeams,
      });

      if (response.data.success) {
        setDefaultTeams(parsedTeams); // 状態を更新
        alert("デフォルトチームを保存しました。");
        // ダイアログを閉じる必要があればここで閉じる
        // setIsDialogOpen(false); // 例
      } else {
        alert("デフォルトチームの保存に失敗しました。");
      }
    } catch (error) {
      console.error("Error saving default teams:", error);
      alert("デフォルトチームの保存中にエラーが発生しました。");
    } finally {
      setIsSavingDefaultTeams(false);
    }
  };

  // Totalタブで表示するチームリストを決定する
  const teamsToDisplay =
    savedMatches.length > 0
      ? totalResults
      : defaultTeams.map((teamName, index) => ({
          name: teamName,
          totalPlacementPoint: 0,
          totalKillPoint: 0,
          totalAllPoint: 0,
          matchCount: 0,
          isOverallWinner: false,
          isMatchPoint: false,
        }));

  return (
    <div className="pt-20 mb-5">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>
            <div className="text-2xl">
              {/* customNameのスケルトンは既存 */}
              {customName ? (
                <h1 className="text-3xl font-extrabold">{customName}</h1>
              ) : (
                <Skeleton className="h-7 w-48" />
              )}
              <div>
                {/* pointRuleのスケルトンを追加 */}
                {/* <p>タグを<div>タグに変更してネストエラーを回避 */}
                <div className="text-sm">
                  ポイントルール：
                  {isPageLoading ? (
                    <Skeleton className="h-4 w-24 inline-block" />
                  ) : (
                    <span>{pointRule}</span>
                  )}
                </div>
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            マッチの詳細情報を表示します。
            <br />
            PP = 順位ポイント、KP = キルポイント、ALL = 合計ポイント
            <br />
            黄色文字はマッチポイントを超えたチームです。
            赤い文字はカスタム勝利チームです。
          </CardDescription>
          <CardAction className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" onClick={() => setIsDialogOpen(true)}>
                  <div className="flex items-center gap-2">
                    <Plus />
                    マッチ追加
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                {dialogStep === 1 ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>
                        <div className="flex items-center gap-2">
                          <Plus />
                          マッチ追加
                        </div>
                      </DialogTitle>
                      <DialogDescription>
                        ポイントを設定の上、マッチを追加してください。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mb-5 grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="name-1">順位ポイント</Label>
                        <Dialog>
                          <DialogTrigger asChild className="w-24">
                            <Button>変更する</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>順位ポイント設定</DialogTitle>
                              <DialogDescription>
                                順位ごとのポイントを設定できます。
                              </DialogDescription>
                              <div className="grid grid-cols-2 gap-2 mt-4">
                                <div className="flex flex-col gap-2">
                                  {/* 1位〜10位 */}
                                  {[...Array(10)].map((_, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center justify-between border rounded px-3 py-1 bg-white"
                                    >
                                      <span>{i + 1}位:</span>
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="number"
                                          className="w-16 h-8 text-right"
                                          value={algsRankPoints[i]}
                                          min={0}
                                          onChange={(e) => {
                                            const newPoints = [
                                              ...algsRankPoints,
                                            ];
                                            newPoints[i] = Number(
                                              e.target.value
                                            );
                                            setAlgsRankPoints(newPoints);
                                          }}
                                        />
                                        pt
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex flex-col gap-2">
                                  {/* 11位〜20位 */}
                                  {[...Array(10)].map((_, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center justify-between border rounded px-3 py-1 bg-white"
                                    >
                                      <span>{i + 11}位:</span>
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="number"
                                          className="w-16 h-8 text-right"
                                          value={algsRankPoints[i + 10]}
                                          min={0}
                                          onChange={(e) => {
                                            const newPoints = [
                                              ...algsRankPoints,
                                            ];
                                            newPoints[i + 10] = Number(
                                              e.target.value
                                            );
                                            setAlgsRankPoints(newPoints);
                                          }}
                                        />
                                        pt
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div>
                        <Label className="mb-2">キルポイント</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            className="w-20 h-8"
                            value={killPoint}
                            min={0}
                            onChange={(e) =>
                              setKillPoint(Number(e.target.value))
                            }
                          />
                          pt
                        </div>
                      </div>
                      {/* Poland Ruleの場合のみキルポイント上限を表示 */}
                      {pointRule === "Poland Rule" && (
                        <div className="grid gap-2">
                          <Label htmlFor="poland-kill-point-limit">
                            Poland Ruleキルポイント上限
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="poland-kill-point-limit" // IDを修正
                              type="number"
                              value={polandKillPointLimit ?? ""} // stateをバインド
                              onChange={(e) =>
                                setPolandKillPointLimit(Number(e.target.value))
                              } // stateを更新
                              required
                              className="w-24"
                            />
                            <p>pt</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button onClick={handleNextStep} disabled={isLoading}>
                        次へ
                        <ArrowRight />
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle>
                        <div className="flex items-center gap-2">
                          <Plus />
                          スタッツコード入力
                        </div>
                      </DialogTitle>
                      <DialogDescription>
                        スタッツコードを入力してマッチを選択してください。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mb-5 grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="stats-code">スタッツコード</Label>
                        <div className="flex gap-2">
                          <Input
                            id="stats-code"
                            type="text"
                            placeholder="スタッツコードを入力してください"
                            value={statsCode}
                            onChange={(e) => setStatsCode(e.target.value)}
                          />
                          <Button
                            onClick={handleFetchMatchData}
                            disabled={isLoading || !statsCode.trim()}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "取得"
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="relative">
                        <ScrollArea className="h-[300px] w-full border rounded-md p-4">
                          {matchData.length > 0 ? (
                            <div className="space-y-2">
                              {matchData.map((match, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                                  onClick={() => handleSelectMatch(match)}
                                >
                                  <div className="flex-1">
                                    <p className="font-medium">
                                      マッチ {index + 1}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {format(
                                        new Date(match.match_start * 1000),
                                        "yyyy/MM/dd HH:mm"
                                      )}{" "}
                                      - {getMapName(match.map_name)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">
                                      {match.player_results.length} プレイヤー
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      チーム数:{" "}
                                      {
                                        new Set(
                                          match.player_results.map(
                                            (player: PlayerResult) =>
                                              player.teamName
                                          )
                                        ).size
                                      }
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            hasFetched && (
                              <div className="text-center p-8 text-gray-500">
                                マッチデータが見つかりませんでした
                              </div>
                            )
                          )}
                        </ScrollArea>

                        {isLoading && (
                          <div className="absolute inset-0 flex flex-col gap-3 items-center justify-center bg-white bg-opacity-75 border rounded-md">
                            <p>データを取得中...</p>
                            <Loader2 className="h-8 w-8 animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={handleBackStep}
                        disabled={isLoading}
                      >
                        戻る
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Share />
                  エクスポート
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Share />
                    エクスポート
                  </DialogTitle>
                  <DialogDescription>
                    任意の形でデータをエクスポートできます。
                    <br />
                    データの更新もここから行えます。
                  </DialogDescription>
                </DialogHeader>
                <div>
                  <div className="flex justify-between items-center gap-2 mb-4">
                    <Label>Google スプレッドシート</Label>
                    <Dialog
                      open={isGoogleDialogOpen}
                      onOpenChange={setIsGoogleDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Image
                            src={GoogleLogo}
                            alt="Google Logo"
                            width={20}
                            height={20}
                          />
                          書き出し
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="min-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Google スプレッドシート連携</DialogTitle>
                          <DialogDescription>
                            スプレッドシートを作成・更新してデータを管理します。
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          {/* Google Login Section */}
                          <div className="flex justify-start">
                            {isLoggedIn ? (
                              <div className="w-full">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="flex items-center gap-2 w-full"
                                    >
                                      <User />
                                      {googleAccount?.email || "アカウント"}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    className="w-56"
                                    align="start"
                                  >
                                    <DropdownMenuLabel>
                                      アカウント操作
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={handleLogout}
                                      className="text-red-500"
                                    >
                                      <LogOut className="mr-2 h-4 w-4 text-red-500" />
                                      ログアウト
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={handleGoogleLogin}
                              >
                                <Image
                                  src={GoogleLogo}
                                  alt="Google Logo"
                                  width={20}
                                  height={20}
                                />
                                Google ログイン
                              </Button>
                            )}
                          </div>

                          {/* Existing Sheet Section */}
                          {existingSheetId && (
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <h4 className="font-semibold mb-2">
                                既存のスプレッドシート
                              </h4>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    window.open(existingSheetUrl!, "_blank")
                                  }
                                >
                                  <ExternalLink />
                                  スプレッドシートを開く
                                </Button>
                                <Button
                                  onClick={handleUpdateGoogleSheet}
                                  disabled={isCreatingSheet}
                                >
                                  {isCreatingSheet ? (
                                    <>
                                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                      <p>データを更新</p>
                                    </>
                                  ) : (
                                    <p>データを更新</p>
                                  )}
                                </Button>
                                {/* 連携解除ボタンを追加 */}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="destructive" size="icon">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        連携を解除しますか？
                                      </DialogTitle>
                                      <DialogDescription>
                                        このカスタム大会とスプレッドシートの連携を解除します。
                                        <br />
                                        スプレッドシート自体は削除されません。
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button variant="outline">
                                          キャンセル
                                        </Button>
                                      </DialogClose>
                                      <Button
                                        variant="destructive"
                                        onClick={handleUnlinkGoogleSheet}
                                      >
                                        連携解除
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          )}

                          {/* Create New Sheet Section */}
                          {isLoggedIn &&
                            !existingSheetId && ( // existingSheetId が存在しない場合のみ表示
                              <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-4">
                                  新しいスプレッドシートを作成
                                </h4>

                                <div className="space-y-4">
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor="sheet-title">
                                      スプレッドシートのタイトル
                                    </Label>
                                    <Input
                                      id="sheet-title"
                                      value={sheetTitle}
                                      onChange={(e) =>
                                        setSheetTitle(e.target.value)
                                      }
                                      placeholder={`${customName} - 結果`}
                                    />
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Label>
                                      保存先フォルダ
                                      <small>
                                        ダブルクリックでサブフォルダを開くことができます
                                      </small>
                                    </Label>
                                    <GoogleDriveSelector
                                      onSelect={setSelectedFolderId}
                                      selectedFolderId={selectedFolderId}
                                      accessToken={googleAccessToken!} // アクセストークンを渡す
                                    />
                                  </div>

                                  <Button
                                    onClick={handleCreateGoogleSheet}
                                    disabled={
                                      isCreatingSheet || !sheetTitle.trim()
                                    }
                                    className="w-full"
                                  >
                                    {isCreatingSheet ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    スプレッドシートを作成
                                  </Button>
                                </div>
                              </div>
                            )}
                        </div>

                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">閉じる</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex justify-between items-center gap-2 mb-4">
                    <Label>画像エクスポート</Label>
                    <Button variant="outline">
                      <Images />
                      ダウンロード
                    </Button>
                  </div>
                  <div className="flex justify-between items-center gap-2 mb-4">
                    <Label>CSV ダウンロード</Label>
                    <Button variant="outline">
                      <FileText />
                      ダウンロード
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ChevronDown />
                  その他
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>その他の操作</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        デフォルトチーム設定
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>デフォルトチーム</DialogTitle>
                        <DialogDescription>
                          デフォルトで表示されるチームを追加します。
                        </DialogDescription>
                      </DialogHeader>
                      <div className="min-h-96 max-h-96">
                        <Textarea
                          placeholder={`カンマ区切り\nチーム1,チーム2,チーム3, ...\n\n改行区切り\nチーム1\nチーム2\nチーム3\n...\n\n読点区切り\nチーム1、チーム2、チーム3、 ...\n\nJson形式\n{ \n  "1": "チーム1",\n  "2": "チーム2",\n  "3": "チーム3"\n}`}
                          className="h-full resize-none"
                          value={defaultTeamsInput} // stateをバインド
                          onChange={(e) => setDefaultTeamsInput(e.target.value)} // stateを更新
                        />
                      </div>
                      <DialogFooter>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Label
                              htmlFor="json-file-upload"
                              className="flex items-center gap-2 cursor-pointer px-4 py-2 border text-gray-900 rounded-md hover:bg-gray-200 transition-colors"
                            >
                              <Input
                                id="json-file-upload"
                                type="file"
                                className="sr-only"
                              />
                              Jsonで追加
                            </Label>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              ・ファイルを持っている方
                              <br />
                              ・有識者向け
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        <DialogClose asChild>
                          <Button
                            variant="default"
                            onClick={handleSaveDefaultTeams} // 保存ハンドラを追加
                            disabled={isSavingDefaultTeams} // ローディング中は無効化
                          >
                            {isSavingDefaultTeams ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            保存
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <DropdownMenuItem>
                    デフォルトの順位ポイント変更
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    デフォルトのキルポイント変更
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 />
                  削除
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>本当に削除しますか？</DialogTitle>
                  <DialogDescription>
                    この操作は取り消せません。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">キャンセル</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDelete}>
                    削除する
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardAction>
        </CardHeader>
        <CardContent>
          {/* ページローディング中はスケルトンを表示 */}
          {isPageLoading ? (
            <div className="space-y-4">
              {/* TabsListのスケルトン */}
              <Skeleton className="h-10 w-full" />
              <div className="space-y-3">
                {/* Total Result ヘッダーのスケルトン */}
                <Skeleton className="h-6 w-48 mb-4" />
                {/* テーブルヘッダー (静的なのでローディング中でも表示) */}
                <div className="grid grid-cols-[80px_1fr_80px_80px_80px] mt-5 bg-[#262626] text-white font-extrabold px-5 py-3">
                  <p>順位</p>
                  <p>チーム名</p>
                  <p>PP</p>
                  <p>KP</p>
                  <p>ALL</p>
                </div>
                {/* チームリストのスケルトン (数行) - テーブル構造に合わせる */}
                {[
                  ...Array(
                    teamsToDisplay.length > 0 ? teamsToDisplay.length : 5
                  ),
                ].map(
                  (
                    _,
                    i // デフォルトチームがあればその数、なければ5行表示
                  ) => (
                    <div
                      key={i}
                      className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3" // 実際のデータ行と同じグリッドとパディング
                    >
                      <Skeleton className="h-6 w-full" /> {/* 順位 */}
                      <Skeleton className="h-6 w-full" /> {/* チーム名 */}
                      <Skeleton className="h-6 w-full" /> {/* PP */}
                      <Skeleton className="h-6 w-full" /> {/* KP */}
                      <Skeleton className="h-6 w-full" /> {/* ALL */}
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            // ローディング終了後は実際のコンテンツを表示
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList>
                <TabsTrigger value="total">Total</TabsTrigger>
                {/* APIから古い順で取得されるため、そのままマップして表示 */}
                {savedMatches.map((match, index) => {
                  // 古い順のリストなので、インデックス+1がそのままマッチ番号
                  const matchNumber = index + 1;
                  return (
                    <TabsTrigger key={match.id} value={`match_${match.id}`}>
                      Match {matchNumber}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="total">
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-7">
                    Total Result
                    <span className="text-sm ml-3 text-gray-600">
                      {matchPoint !== null &&
                        matchPoint !== undefined &&
                        `(Match Point: ${matchPoint}pt)`}
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-[80px_1fr_80px_80px_80px] mt-5 bg-[#262626] text-white font-extrabold px-5 py-3">
                  <p>順位</p>
                  <p>チーム名</p>
                  <p>PP</p>
                  <p>KP</p>
                  <p>ALL</p>
                </div>
                {/* savedMatchesが空の場合はdefaultTeamsを表示 */}
                {teamsToDisplay.map((team, index) => {
                  const isWinner = team.isOverallWinner;
                  const isMatchPointTeam = team.isMatchPoint;

                  // 表示する文字色を決定
                  const textColorClass = isWinner
                    ? "text-red-500" // 勝者は赤
                    : isMatchPointTeam
                    ? "text-yellow-500" // マッチポイントチームは黄色
                    : ""; // それ以外はデフォルト

                  return (
                    <div
                      key={team.name}
                      className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3"
                    >
                      {/* savedMatchesが空の場合は順位を0と表示 */}
                      <p>{savedMatches.length > 0 ? index + 1 : 0}</p>
                      <p>{team.name}</p>
                      <p>{team.totalPlacementPoint}</p>
                      <p>{team.totalKillPoint}</p>
                      {/* 文字色クラスを適用 */}
                      <p className={textColorClass}>{team.totalAllPoint}</p>
                    </div>
                  );
                })}
              </TabsContent>
              {/* savedMatchesは古い順で取得されるため、そのままマップして表示 */}
              {savedMatches.map((match, index) => {
                // 古い順のリストなので、インデックス+1がそのままマッチ番号
                const matchNumber = index + 1;
                return (
                  <TabsContent key={match.id} value={`match_${match.id}`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">
                        Match {matchNumber} Result
                        <span className="text-sm ml-3 text-gray-600">
                          {getMapName(match.mapName || match.map_name)} -{" "}
                          {isNaN(
                            new Date(
                              match.matchStart
                                ? Number(match.matchStart) * 1000
                                : match.match_start * 1000
                            ).getTime()
                          )
                            ? "Format Error"
                            : format(
                                new Date(
                                  match.matchStart
                                    ? Number(match.matchStart) * 1000
                                    : match.match_start * 1000
                                ),
                                "yyyy/MM/dd HH:mm"
                              )}
                        </span>
                      </h3>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteMatch(match.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        マッチを削除
                      </Button>
                    </div>
                    <div className="grid grid-cols-[80px_1fr_80px_80px_80px] mt-5 bg-[#262626] text-white font-extrabold px-5 py-3">
                      <p>順位</p>
                      <p>チーム名</p>
                      <p>PP</p>
                      <p>KP</p>
                      <p>ALL</p>
                    </div>
                    {match.teamResult.map((team: TeamResult) => (
                      <div
                        key={team.id}
                        className="grid grid-cols-[80px_1fr_80px_80px_80px] font-extrabold px-5 py-3"
                      >
                        <p>{team.placement}</p>
                        <p>{team.name}</p>
                        <p>{team.placementPoint}</p>
                        <p>{team.killPoint}</p>
                        <p>{team.allPoint}</p>
                      </div>
                    ))}
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
