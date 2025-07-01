"use client";

import { useState } from "react";
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

interface User {
  id: string;
  displayName: string;
  email: string;
  roles: Role[];
  teams: string[];
}

interface Role {
  id: string;
  name: "read" | "write" | "create" | "delete" | "admin";
  label: string;
}

const availableRoles: Role[] = [
  { id: "1", name: "read", label: "読み" },
  { id: "2", name: "write", label: "書き" },
  { id: "3", name: "create", label: "作成" },
  { id: "4", name: "delete", label: "削除" },
  { id: "5", name: "admin", label: "管理者" },
];

const availableTeams = [
  "開発チーム",
  "デザインチーム",
  "マーケティングチーム",
  "営業チーム",
];

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      displayName: "田中太郎",
      email: "tanaka@example.com",
      roles: [
        { id: "1", name: "read", label: "読み" },
        { id: "2", name: "write", label: "書き" },
      ],
      teams: ["開発チーム"],
    },
    {
      id: "2",
      displayName: "佐藤花子",
      email: "sato@example.com",
      roles: [{ id: "5", name: "admin", label: "管理者" }],
      teams: ["開発チーム", "デザインチーム"],
    },
  ]);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
      setIsEditDialogOpen(false);
      setEditingUser(null);
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

  const handleRoleChange = (roleId: string, checked: boolean) => {
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

  const handleInviteUser = () => {
    if (inviteEmail && selectedTeams.length > 0) {
      // ここで招待処理を実行
      alert(`${inviteEmail} を ${selectedTeams.join(", ")} に招待しました`);
      setInviteEmail("");
      setSelectedTeams([]);
      setIsInviteDialogOpen(false);
    }
  };

  const handleSync = () => {
    // ここで同期処理を実装
    setIsSyncDialogOpen(true);
  };

  return (
    <div className="p-6">
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
                      <div key={team} className="flex items-center space-x-2">
                        <Checkbox
                          id={team}
                          checked={selectedTeams.includes(team)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTeams([...selectedTeams, team]);
                            } else {
                              setSelectedTeams(
                                selectedTeams.filter((t) => t !== team)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={team}>{team}</Label>
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

      <Card>
        <CardHeader>
          <CardTitle>ユーザー一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>表示名</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>チーム</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((role) => (
                        <Badge key={role.id} variant="secondary">
                          {role.label}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.teams.map((team) => (
                        <Badge key={team} variant="outline">
                          {team}
                        </Badge>
                      ))}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ユーザー編集</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="display-name">表示名</Label>
                <Input
                  id="display-name"
                  value={editingUser.displayName}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      displayName: e.target.value,
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
                <div className="mt-2 space-y-2">
                  {availableRoles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={role.id}
                        checked={editingUser.roles.some(
                          (r) => r.id === role.id
                        )}
                        onCheckedChange={(checked) =>
                          handleRoleChange(role.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={role.id}>{role.label}</Label>
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
                  <span className="font-bold">{deleteTarget.displayName}</span>
                  （{deleteTarget.email}）を削除しますか？
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
