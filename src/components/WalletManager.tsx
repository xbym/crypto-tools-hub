import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

interface WalletInfo {
  id: string;
  name: string;
  type: string;
  address: string;
}

interface User {
  id: string;
  username: string;
  solWalletPublicKey: string;
}

export default function WalletManager() {
  const [privateKey, setPrivateKey] = useState('')
  const [wallets, setWallets] = useState<WalletInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const API_KEY = '6myjdpr69lkzbwayitz6z0sd2jks277w'
  const API_BASE_URL = 'https://api-bot-v1.dbotx.com/account/wallets'

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      importWalletFromServer(parsedUser.id)
    }
  }, [])

  const importWalletFromServer = async (userId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`http://localhost:5000/api/wallet/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("服务器返回了非JSON格式的数据");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP 错误! 状态: ${response.status}`);
      }

      const data = await response.json();
      if (data.privateKey) {
        await importWallet(data.privateKey);
      } else {
        throw new Error("未找到私钥");
      }
    } catch (error) {
      console.error('从服务器导入钱包错误:', error);
      setError(error instanceof Error ? error.message : "导入过程中发生未知错误，请稍后重试。");
      toast({
        title: "钱包导入失败",
        description: error instanceof Error ? error.message : "导入过程中发生未知错误，请稍后重试。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const importWallet = async (key: string = privateKey) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
        body: JSON.stringify({
          type: 'solana',
          privateKeys: [key],
        }),
      })

      const data = await response.json()
      
      if (data.err === false && Array.isArray(data.res)) {
        setWallets(data.res)
        toast({
          title: "钱包导入成功",
          description: `已导入 ${data.res.length} 个钱包`,
        })
        setPrivateKey('') // 清空私钥输入框
      } else {
        // 即使状态码是 400，我们也尝试解析响应
        throw new Error(data.err || "导入失败")
      }
    } catch (error) {
      console.error('钱包导入错误:', error)
      // 不设置 error 状态，因为钱包可能已经成功导入
      toast({
        title: "钱包导入提示",
        description: "钱包可能已成功导入，但过程中出现了一些问题。请检查您的钱包信息。",
        variant: "default",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Solana 钱包管理</CardTitle>
        <CardDescription>导入您的 Solana 钱包并查看信息</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {user ? (
          <p className="mb-4">欢迎, {user.username}! {wallets.length > 0 ? "您的钱包已自动导入。" : "正在导入您的钱包..."}</p>
        ) : (
          <div className="mb-4">
            <p className="mb-2">您尚未登录。请输入私钥以导入钱包。</p>
            <form onSubmit={(e) => { e.preventDefault(); importWallet(); }} className="space-y-4">
              <div>
                <label htmlFor="privateKey" className="block text-sm font-medium text-gray-700">
                  私钥
                </label>
                <Input
                  id="privateKey"
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="输入您的 Solana 钱包私钥"
                  className="mt-1"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading || !privateKey.trim()}>
                {isLoading ? "导入中..." : "导入钱包"}
              </Button>
            </form>
          </div>
        )}
        {isLoading && <p className="text-center mt-4">正在导入钱包...</p>}
        {wallets.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">导入的钱包信息</h3>
            {wallets.map((wallet) => (
              <div key={wallet.id} className="p-4 bg-gray-100 rounded-md mb-2 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="font-semibold">ID:</p>
                    <p className="break-all">{wallet.id}</p>
                  </div>
                  <div>
                    <p className="font-semibold">名称:</p>
                    <p className="break-all">{wallet.name}</p>
                  </div>
                  <div>
                    <p className="font-semibold">类型:</p>
                    <p>{wallet.type}</p>
                  </div>
                  <div>
                    <p className="font-semibold">地址:</p>
                    <p className="break-all">{wallet.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}