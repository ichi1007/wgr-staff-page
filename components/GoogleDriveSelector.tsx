"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, ChevronRight, Home } from "lucide-react";
import axios from "axios";

interface DriveFile {
  id: string;
  name: string;
  isFolder: boolean;
  mimeType: string;
}

interface GoogleDriveSelectorProps {
  onSelect: (folderId: string | null) => void;
  selectedFolderId: string | null;
  accessToken: string; // アクセストークンを受け取る
}

export default function GoogleDriveSelector({
  onSelect,
  selectedFolderId,
  accessToken,
}: GoogleDriveSelectorProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>("root");
  const [breadcrumbs, setBreadcrumbs] = useState<
    Array<{ id: string; name: string }>
  >([{ id: "root", name: "マイドライブ" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null); // エラーをリセット
    try {
      const response = await axios.get("/api/google/drive/folders", {
        params: { folderId: currentFolderId || "root" },
        headers: {
          Authorization: `Bearer ${accessToken}`, // アクセストークンをヘッダーに追加
        },
      });
      const folders = response.data.files.filter(
        (file: DriveFile) => file.isFolder
      );
      setFiles(folders);
      if (folders.length === 0) {
        setError("フォルダがありません");
      }
    } catch (error) {
      console.error("ファイル取得エラー:", error);
      setError("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId, accessToken]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFolderClick = (folder: DriveFile) => {
    onSelect(folder.id); // シングルクリックで選択
  };

  const handleFolderDoubleClick = (folder: DriveFile) => {
    setCurrentFolderId(folder.id); // ダブルクリックでサブフォルダを開く
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  const handleSelectFolder = () => {
    onSelect(currentFolderId);
  };

  return (
    <div className="w-full mx-auto border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center">
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="hover:text-blue-600 flex items-center"
              >
                {index === 0 ? <Home className="w-4 h-4" /> : crumb.name}
              </button>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="w-4 h-4 mx-1" />
              )}
            </div>
          ))}
        </div>
        <Button
          onClick={handleSelectFolder}
          variant={selectedFolderId === currentFolderId ? "default" : "outline"}
          className="w-full"
        >
          {currentFolderId === "root"
            ? "マイドライブ"
            : breadcrumbs[breadcrumbs.length - 1].name}
          を選択
        </Button>
      </div>

      <ScrollArea className="h-64 w-full border rounded p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500" style={{ userSelect: "none" }}>
              読み込み中...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500" style={{ userSelect: "none" }}>
              {error}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer ${
                  selectedFolderId === file.id ? "bg-blue-100" : ""
                }`}
                onClick={() => handleFolderClick(file)} // シングルクリック
                onDoubleClick={() => handleFolderDoubleClick(file)} // ダブルクリック
                style={{ userSelect: "none" }} // テキスト選択を無効化
              >
                <Folder className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm">{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
