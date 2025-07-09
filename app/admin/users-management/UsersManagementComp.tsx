"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Edit,
  UserPlus,
  Mail,
  UsersRound,
  RefreshCw,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  teams: Team[];
  status?: boolean;
  avatar?: string;
}

interface Role {
  id: number;
  name: string;
  label: string;
}

interface Team {
  id: number;
  name: string;
}

const USERS_PER_PAGE = 10; // 1ページあたりのユーザー数

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // ページネーション用の計算
  const paginationData = useMemo(() => {
    const totalUsers = users.length;
    const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    const currentUsers = users.slice(startIndex, endIndex);

    return {
      totalUsers,
      totalPages,
      currentUsers,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }, [users, currentPage]);

  // データベースからロール情報を取得
  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      if (response.ok) {
        const rolesData = await response.json();
        setAvailableRoles(rolesData);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // データベースからチーム情報を取得
  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams");
      if (response.ok) {
        const teamsData = await response.json();
        setAvailableTeams(teamsData);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  // データベースからユーザー情報を取得
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
        // ユーザー数が変わった場合のページ調整
        const newTotalPages = Math.ceil(userData.length / USERS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchTeams();
    fetchUsers();
  }, []);

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          roles: editingUser.roles,
          teams: editingUser.teams,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map((u) => (u.id === editingUser.id ? updatedUser : u)));
        setIsEditDialogOpen(false);
        setEditingUser(null);
      } else {
        const errorData = await response.json();
        alert(`エラー: ${errorData.error || "ユーザーの更新に失敗しました"}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("ユーザーの更新中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteUser = (user: User) => {
    setDeleteTarget(user);
  };

  const handleDeleteUser = () => {
    if (deleteTarget) {
      setUsers(users.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (!editingUser) return;

    const role = availableRoles.find((r) => r.id === roleId);
    if (!role) return;

    if (checked) {
      setEditingUser({
        ...editingUser,
        roles: [...editingUser.roles, role],
      });
    } else {
      setEditingUser({
        ...editingUser,
        roles: editingUser.roles.filter((r) => r.id !== roleId),
      });
    }
  };

  const handleTeamChange = (teamId: number, checked: boolean) => {
    if (!editingUser) return;

    const team = availableTeams.find((t) => t.id === teamId);
    if (!team) return;

    if (checked) {
      setEditingUser({
        ...editingUser,
        teams: [...editingUser.teams, team],
      });
    } else {
      setEditingUser({
        ...editingUser,
        teams: editingUser.teams.filter((t) => t.id !== teamId),
      });
    }
  };

  const handleInviteUser = () => {
    if (inviteEmail && selectedTeamIds.length > 0) {
      const selectedTeamNames = availableTeams
        .filter((team) => selectedTeamIds.includes(team.id))
        .map((team) => team.name);
      alert(`${inviteEmail} を ${selectedTeamNames.join(", ")} に招待しました`);
      setInviteEmail("");
      setSelectedTeamIds([]);
      setIsInviteDialogOpen(false);
    }
  };

  const handleSync = () => {
    fetchUsers();
    setIsSyncDialogOpen(true);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page);
    }
  };

  const generatePageNumbers = () => {
    const { totalPages } = paginationData;
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const getAvatarUrl = (
    avatar: string | null,
    userId: string
  ): string | undefined => {
    if (!avatar) return undefined;
    if (avatar.startsWith("http")) return avatar;
    return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=128`;
  };

  return (
    <div className="pt-20 p-6 h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UsersRound />
          ユーザー管理
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSync}>
            <RefreshCw className="mr-2 h-4 w-4" />
            同期
          </Button>
          <Dialog
            open={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                ユーザー招待
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>チームにユーザーを招待</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-email">メールアドレス</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label>招待するチーム</Label>
                  <div className="mt-2 space-y-2">
                    {availableTeams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`invite-team-${team.id}`}
                          checked={selectedTeamIds.includes(team.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTeamIds([...selectedTeamIds, team.id]);
                            } else {
                              setSelectedTeamIds(
                                selectedTeamIds.filter((id) => id !== team.id)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`invite-team-${team.id}`}>
                          {team.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleInviteUser} className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  招待を送信
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="h-[80vh]">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>ユーザー一覧</span>
            <span className="text-sm font-normal text-gray-500">
              {paginationData.totalUsers}人中{" "}
              {(currentPage - 1) * USERS_PER_PAGE + 1}-
              {Math.min(
                currentPage * USERS_PER_PAGE,
                paginationData.totalUsers
              )}
              人目を表示
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">読み込み中...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>表示名</TableHead>
                  <TableHead>メールアドレス</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>ロール</TableHead>
                  <TableHead>チーム</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginationData.currentUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {users.length === 0
                        ? "ユーザーが見つかりません"
                        : "このページにはユーザーがいません"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginationData.currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="flex items-center gap-2">
                        {user.avatar && (
                          <img
                            src={getAvatarUrl(user.avatar, user.id)}
                            alt={user.name}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.status ? "default" : "secondary"}>
                          {user.status ? "有効" : "無効"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge key={role.id} variant="secondary">
                                {role.label}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-500">なし</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.teams.length > 0 ? (
                            user.teams.map((team) => (
                              <Badge key={team.id} variant="outline">
                                {team.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-500">未所属</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDeleteUser(user)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {paginationData.totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => goToPage(currentPage - 1)}
                className={
                  !paginationData.hasPreviousPage
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {currentPage > 3 && paginationData.totalPages > 5 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => goToPage(1)}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              </>
            )}

            {generatePageNumbers().map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => goToPage(page)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {currentPage < paginationData.totalPages - 2 &&
              paginationData.totalPages > 5 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => goToPage(paginationData.totalPages)}
                      className="cursor-pointer"
                    >
                      {paginationData.totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

            <PaginationItem>
              <PaginationNext
                onClick={() => goToPage(currentPage + 1)}
                className={
                  !paginationData.hasNextPage
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ユーザー編集</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="display-name">表示名</Label>
                <Input
                  id="display-name"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>ロール</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {availableRoles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={editingUser.roles.some(
                          (r) => r.id === role.id
                        )}
                        onCheckedChange={(checked) =>
                          handleRoleChange(role.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`role-${role.id}`}>{role.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>チーム</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {availableTeams.map((team) => (
                    <div key={team.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`team-${team.id}`}
                        checked={editingUser.teams.some(
                          (t) => t.id === team.id
                        )}
                        onCheckedChange={(checked) =>
                          handleTeamChange(team.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`team-${team.id}`}>{team.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveUser} className="flex-1">
                  保存
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  キャンセル
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>同期完了</DialogTitle>
          </DialogHeader>
          <div>ユーザー情報を最新の状態に同期しました。</div>
          <Button
            onClick={() => setIsSyncDialogOpen(false)}
            className="mt-4 w-full"
          >
            閉じる
          </Button>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザー削除の確認</DialogTitle>
          </DialogHeader>
          <div>
            {deleteTarget && (
              <>
                <p>
                  <span className="font-bold">{deleteTarget.name}</span>（
                  {deleteTarget.email}）を削除しますか？
                </p>
                <div className="flex gap-2 mt-6">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteUser}
                    className="flex-1"
                  >
                    削除
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
