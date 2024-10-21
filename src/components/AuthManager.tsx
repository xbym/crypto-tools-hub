import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

interface User {
  id: string;
  username: string;
  solWalletPublicKey?: string;
  feeIncome?: number;
}

export default function AuthManager() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviterUsername, setInviterUsername] = useState('');
  const [user, setUser] = useState<User | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';
    try {
      const body = isLogin 
        ? JSON.stringify({ username, password })
        : JSON.stringify({ username, password, inviterUsername });

      const response = await fetch(`https://xbym-12f71894013e.herokuapp.com/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '认证失败');
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast({
          title: isLogin ? "登录成功" : "注册成功",
          description: `欢迎, ${data.user.username}!`,
        });
        if (!isLogin && data.user.solWalletPublicKey) {
          toast({
            title: "SOL 钱包已生成",
            description: `您的 SOL 钱包地址: ${data.user.solWalletPublicKey}`,
          });
        }
      } else {
        throw new Error(data.message || "认证失败");
      }
    } catch (error) {
      console.error('认证错误:', error);
      toast({
        title: "认证失败",
        description: error instanceof Error ? error.message : "认证过程中发生未知错误，请稍后重试。",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "登出成功",
      description: "您已成功登出。",
    });
  };

  if (user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>欢迎, {user.username}!</CardTitle>
          <CardDescription>您已成功登录</CardDescription>
        </CardHeader>
        <CardContent>
          {user.solWalletPublicKey && (
            <p className="mb-4">SOL 钱包地址: {user.solWalletPublicKey}</p>
          )}
          {user.feeIncome !== undefined && (
            <p className="mb-4">累计手续费收入: {user.feeIncome} SOL</p>
          )}
          <Button onClick={handleLogout}>登出</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isLogin ? "登录" : "注册"}</CardTitle>
        <CardDescription>{isLogin ? "登录您的账户" : "创建一个新账户"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              用户名
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              密码
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div>
              <label htmlFor="inviterUsername" className="block text-sm font-medium text-gray-700">
                邀请人用户名（可选）
              </label>
              <Input
                id="inviterUsername"
                type="text"
                value={inviterUsername}
                onChange={(e) => setInviterUsername(e.target.value)}
              />
            </div>
          )}
          <Button type="submit" className="w-full">
            {isLogin ? "登录" : "注册"}
          </Button>
        </form>
        <p className="mt-4 text-center">
          {isLogin ? "没有账户？" : "已有账户？"}
          <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "注册" : "登录"}
          </Button>
        </p>
      </CardContent>
    </Card>
  );
}