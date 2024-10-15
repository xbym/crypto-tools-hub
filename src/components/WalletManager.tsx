import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface WalletInfo {
  address: string;
  balance: string;
  lamports: number;
}

export default function WalletManager() {
  const [privateKey, setPrivateKey] = useState('')
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const importWallet = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('https://api.dbotx.com/v1/wallet/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'YOUR_API_KEY_HERE', // 请替换为您的实际API密钥
        },
        body: JSON.stringify({
          chain: 'solana',
          privateKey: privateKey,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.code === 0) {
        toast({
          title: "钱包导入成功",
          description: `地址: ${data.data.address}`,
        })
        await getWalletInfo(data.data.address)
      } else {
        throw new Error(data.msg || "导入失败")
      }
    } catch (error) {
      console.error('Wallet import error:', error)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setError('无法连接到服务器。请检查以下内容：\n1. 您的网络连接是否正常\n2. 服务器地址是否正确\n3. 服务器是否在运行\n4. 是否存在跨域（CORS）问题\n如果问题持续，请联系技术支持。')
      } else {
        setError(error instanceof Error ? error.message : "导入过程中发生未知错误，请稍后重试。")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getWalletInfo = async (address: string) => {
    try {
      const response = await fetch(`https://api.dbotx.com/v1/wallet/info?chain=solana&address=${address}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': '6myjdpr69lkzbwayitz6z0sd2jks277w', // 请替换为您的实际API密钥
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.code === 0) {
        setWalletInfo({
          address: data.data.address,
          balance: data.data.balance,
          lamports: data.data.lamports,
        })
      } else {
        throw new Error(data.msg || "获取钱包信息失败")
      }
    } catch (error) {
      console.error('Get wallet info error:', error)
      toast({
        title: "获取钱包信息失败",
        description: error instanceof Error ? error.message : "获取钱包信息过程中发生错误，请稍后重试。",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Solana 钱包管理</CardTitle>
        <CardDescription>导入您的 Solana 钱包并查看信息</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4">
            <Alert variant="destructive">
              <AlertTitle>错误</AlertTitle>
              <AlertDescription>
                {error}
                {error.includes('无法连接到服务器') && (
                  <div className="mt-2">
                    <p>调试提示：</p>
                    <ul className="list-disc pl-5">
                      <li>确保您的 API 密钥已正确设置</li>
                      <li>检查 API 端点 URL 是否正确</li>
                      <li>如果在本地开发环境中运行，尝试使用代理服务器</li>
                      <li>检查浏览器控制台是否有更多错误信息</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); importWallet(); }} className="space-y-4">
          <div>
            <label htmlFor="privateKey" className="block text-sm font-medium text-gray-700">
              私钥
            </label>
            <Input
              id="privateKey"
              name="privateKey"
              type="password"
              placeholder="输入 Solana 私钥"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="bg-gray-100 mt-1"
              required
            />
          </div>
          <Button 
            type="submit"
            className="w-full" 
            disabled={isLoading || !privateKey.trim()}
          >
            {isLoading ? "导入中..." : "导入钱包"}
          </Button>
        </form>
        {walletInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="font-bold mb-2">钱包信息</h3>
            <p>地址: {walletInfo.address}</p>
            <p>余额: {walletInfo.balance} SOL</p>
            <p>Lamports: {walletInfo.lamports}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}