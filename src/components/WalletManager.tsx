'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Copy } from "lucide-react"

interface WalletInfo {
  id: string;
  name: string;
  type: string;
  address: string;
  feeIncome: number;
}

interface User {
  id: string;
  username: string;
  solWalletPublicKey: string;
  type: 'normal' | 'admin';
  follow: boolean;
  feeIncome: number;
}

interface SwapOrderParams {
  chain: 'solana' | 'base' | 'bsc' | 'ethereum' | 'arbitrum' | 'tron';
  pair: string;
  walletId: string;
  type: 'buy' | 'sell';
  amountOrPercent: number;
  stopEarnPercent?: number;
  stopLossPercent?: number;
  stopEarnGroup?: { pricePercent: number; amountPercent: number }[];
  stopLossGroup?: { pricePercent: number; amountPercent: number }[];
  priorityFee?: string;
  gasFeeDelta?: number;
  maxFeePerGas?: number;
  jitoEnabled: boolean;
  jitoTip?: number;
  maxSlippage: number;
  concurrentNodes: number;
  retries: number;
}

const FEE_PERCENTAGE = 1; // 1.2%

export default function WalletManager() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isCopyTrading, setIsCopyTrading] = useState(false)
  const [copyTradingAmount, setCopyTradingAmount] = useState<number>(0)
  const [isWithdrawingFee, setIsWithdrawingFee] = useState(false)
  const [inviteLink, setInviteLink] = useState('')

  const [swapParams, setSwapParams] = useState<SwapOrderParams>({
    chain: 'solana',
    pair: '',
    walletId: '',
    type: 'buy',
    amountOrPercent: 0,
    stopEarnPercent: 0.5,
    stopLossPercent: 0.5,
    jitoEnabled: false,
    jitoTip: 0,
    priorityFee: '',
    gasFeeDelta: 0,
    maxFeePerGas: 0,
    maxSlippage: 0.01,
    concurrentNodes: 1,
    retries: 3,
  })

  const API_KEY = '6myjdpr69lkzbwayitz6z0sd2jks277w'
  const SWAP_API_URL = 'https://api-bot-v1.dbotx.com/automation/swap_order'
  const BACKEND_URL = 'https://xbym-12f71894013e.herokuapp.com'

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      fetchWalletInfo(parsedUser.id)
    }
  }, [])

  const fetchWalletInfo = async (userId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${BACKEND_URL}/api/wallet/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP 错误! 状态: ${response.status}`);
      }

      const data = await response.json();
      setWalletInfo({
        id: data.importedWalletId,
        name: "Solana Wallet",
        type: "solana",
        address: data.publicKey,
        feeIncome: data.feeIncome
      });
      setSwapParams(prev => ({ ...prev, walletId: data.importedWalletId }));
    } catch (error) {
      console.error('获取钱包信息错误:', error);
      setError(error instanceof Error ? error.message : "获取钱包信息过程中发生未知错误，请稍后重试。");
      toast({
        title: "获取钱包信息失败",
        description: error instanceof Error ? error.message : "获取钱包信息过程中发生未知错误，请稍后重试。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSwapOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      let adjustedAmount = swapParams.amountOrPercent;
      let feeAmount = 0;

      if (swapParams.type === 'buy') {
        // Calculate the fee
        feeAmount = swapParams.amountOrPercent * FEE_PERCENTAGE;
        
        // Adjust the buy amount after deducting the fee
        adjustedAmount -= feeAmount;
      }

      // Proceed with the swap order
      const response = await fetch(SWAP_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
        body: JSON.stringify({
          ...swapParams,
          amountOrPercent: adjustedAmount
        }),
      })

      const data = await response.json();

      // Send the fee transaction regardless of the swap order result
      if (swapParams.type === 'buy') {
        const feeResponse = await fetch(`${BACKEND_URL}/api/send-fee`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            amount: feeAmount,
            type: swapParams.type
          }),
        });

        if (!feeResponse.ok) {
          console.error('Failed to send fee transaction');
          toast({
            title: "手续费交易失败",
            description: "手续费交易发送失败，但主交易可能已完成。",
            variant: "destructive"
          });
        } else {
          toast({
            title: "手续费交易成功",
            description: `手续费: ${feeAmount} SOL`,
          });
        }
      }

      // Check if the swap order was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // If the user is an admin, update the followpair
      if (user?.type === 'admin') {
        await updateFollowPair(swapParams.pair);
      }

      toast({
        title: "交易订单已提交",
        description: `订单ID: ${data.orderId || '未知'}`,
      })
    } catch (error) {
      console.error('交易订单提交错误:', error)
      setError(error instanceof Error ? error.message : "提交过程中发生未知错误，请稍后重试。")
      toast({
        title: "交易订单提交失败",
        description: error instanceof Error ? error.message : "提交过程中发生未知错误，请稍后重试。",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFollowPair = async (pair: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/update-followpair`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          pair: pair
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update followpair');
      }

      await response.json(); 

    } catch (error) {
      console.error('更新 followpair 错误:', error);
    }
  }

  const handleCopyTrading = async () => {
    if (!user) {
      toast({
        title: "错误",
        description: "请先登录",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/update-follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          follow: true,
          copyTradingAmount: copyTradingAmount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update follow status');
      }

      await response.json(); 
      setUser(prevUser => prevUser ? {...prevUser, follow: true} : null);
      toast({
        title: "跟单已开启",
        description: `跟单金额: ${copyTradingAmount}`,
      });
    } catch (error) {
      console.error('更新跟单状态错误:', error);
      toast({
        title: "开启跟单失败",
        description: error instanceof Error ? error.message : "开启跟单过程中发生未知错误，请稍后重试。",
        variant: "destructive",
      });
    }
  }

  const handleWithdrawFee = async () => {
    if (!user) {
      toast({
        title: "错误",
        description: "请先登录",
        variant: "destructive",
      });
      return;
    }

    setIsWithdrawingFee(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/withdraw-fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw fee');
      }

      const data = await response.json();
      setWalletInfo(prevInfo => prevInfo ? {...prevInfo, feeIncome: 0} : null);
      toast({
        title: "手续费提取成功",
        description: `提取金额: ${data.withdrawalAmount} SOL`,
      });
    } catch (error) {
      console.error('提取手续费错误:', error);
      toast({
        title: "提取手续费失败",
        description: error instanceof Error ? error.message : "提取手续费过程中发生未知错误，请稍后重试。",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawingFee(false);
    }
  }

  const generateInviteLink = () => {
    if (user) {
      const link = `${window.location.origin}?invite=${user.username}`
      setInviteLink(link)
      toast({
        title: "邀请链接已生成",
        description: "链接已复制到剪贴板",
      })
      navigator.clipboard.writeText(link)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Solana 钱包管理</CardTitle>
        <CardDescription>查看您的 Solana 钱包信息</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4">
            <Alert variant="destructive">
              <AlertTitle>错误</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        {user ? (
          <p className="mb-4 text-center">欢迎, {user.username}! {walletInfo ? "您的钱包信息已加载。" : "正在加载您的钱包信息..."}</p>
        ) : (
          <p className="mb-4 text-center">您尚未登录。请先登录以查看您的钱包信息。</p>
        )}
        {isLoading && <p className="text-center mt-4">正在加载钱包信息...</p>}
        {walletInfo && (
          <div className="mt-6">
            <h3 className="font-bold mb-4 text-lg text-center">钱包信息</h3>
            <Card className="mb-4">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-sm text-gray-500">ID:</p>
                    <p className="break-all">{walletInfo.id}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-500">名称:</p>
                    <p className="break-all">{walletInfo.name}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-500">类型:</p>
                    <p>{walletInfo.type}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-500">地址:</p>
                    <p className="break-all">{walletInfo.address}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-500">手续费收入:</p>
                    <p>{walletInfo.feeIncome} SOL</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button 
               
              onClick={handleWithdrawFee}
              disabled={isWithdrawingFee || walletInfo.feeIncome <= 0} 
              className="w-full mb-4"
            >
              {isWithdrawingFee ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提取中...
                </>
              ) : (
                "提取手续费收入"
              )}
            </Button>
          </div>
        )}
        
        {user?.type === 'normal' && (
          <div className="mt-4 mb-8">
            <Button onClick={() => setIsCopyTrading(!isCopyTrading)} 
             className="w-full bg-blue-600  hover:bg-blue-700 text-white">
              {isCopyTrading ? "返回交易界面" : "进入跟单界面"}
            </Button>
          </div>
        )}

        {user && (
          <div className="mt-4 mb-8">
            <h3 className="font-bold mb-4 text-lg text-center">邀请好友</h3>
            <div className="flex items-center space-x-2">
              <Input
                value={inviteLink}
                readOnly
                className="flex-grow bg-white text-gray-800 border-gray-300"
                placeholder="点击生成邀请链接"
              />
              <Button onClick={generateInviteLink} className="flex items-center bg-green-600 hover:bg-green-700 text-white">
                <Copy className="mr-2 h-4 w-4" />
                生成链接
              </Button>
            </div>
          </div>
        )}

        {isCopyTrading ? (
          <div className="mt-8">
            <h3 className="font-bold mb-4 text-lg  text-center">跟单设置</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="copyTradingAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  跟单金额
                </label>
                <Input
                  id="copyTradingAmount"
                  type="number"
                  value={copyTradingAmount}
                  onChange={(e) => setCopyTradingAmount(parseFloat(e.target.value))}
                  placeholder="输入跟单金额"
                  className="bg-white"
                  required
                />
              </div>
              <Button 
                onClick={handleCopyTrading}
                disabled={isLoading || copyTradingAmount <= 0} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  "开启跟单"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <h3 className="font-bold mb-4 text-lg text-center">快速买卖</h3>
            <form onSubmit={handleSwapOrderSubmit} className="space-y-4">
              <div>
                <label htmlFor="chain" className="block text-sm font-medium text-gray-700 mb-1">
                  链
                </label>
                <Select
                  value={swapParams.chain}
                  onValueChange={(value: SwapOrderParams['chain']) => setSwapParams({...swapParams, chain: value})}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="选择链" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="solana">Solana</SelectItem>
                    <SelectItem value="base">Base</SelectItem>
                    <SelectItem value="bsc">BSC</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    <SelectItem value="tron">Tron</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="pair" className="block text-sm font-medium text-gray-700 mb-1">
                  交易对地址
                </label>
                <Input
                  id="pair"
                  type="text"
                  value={swapParams.pair}
                  onChange={(e) => setSwapParams({...swapParams, pair: e.target.value})}
                  placeholder="输入代币地址或交易对地址"
                  className="bg-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  交易类型
                </label>
                <Select
                  value={swapParams.type}
                  onValueChange={(value: 'buy' | 'sell') => setSwapParams({...swapParams, type: value})}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="选择交易类型" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="buy">买入</SelectItem>
                    <SelectItem value="sell">卖出</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="amountOrPercent" className="block text-sm font-medium text-gray-700 mb-1">
                  {swapParams.type === 'buy' ? '买入金额' : '卖出比例'}
                </label>
                <Input
                  id="amountOrPercent"
                  type="number"
                  value={swapParams.amountOrPercent}
                  onChange={(e) => setSwapParams({...swapParams, amountOrPercent: parseFloat(e.target.value)})}
                  placeholder={swapParams.type === 'buy' ? "输入买入金额" : "输入卖出比例 (0.00-1.00)"}
                  step="0.01"
                  min={swapParams.type === 'buy' ? "0" : "0"}
                  max={swapParams.type === 'buy' ? undefined : "1"}
                  className="bg-white"
                  required
                />
              </div>
              {swapParams.type === 'buy' && (
                <>
                  <div>
                    <label htmlFor="stopEarnPercent" className="block text-sm font-medium text-gray-700 mb-1">
                      止盈比例
                    </label>
                    <Input
                      id="stopEarnPercent"
                      type="number"
                      value={swapParams.stopEarnPercent}
                      onChange={(e) => setSwapParams({...swapParams, stopEarnPercent: parseFloat(e.target.value)})}
                      placeholder="输入止盈比例 (0.00-1.00)"
                      step="0.01"
                      min="0"
                      max="1"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="stopLossPercent" className="block text-sm font-medium text-gray-700 mb-1">
                      止损比例
                    </label>
                    <Input
                      id="stopLossPercent"
                      type="number"
                      value={swapParams.stopLossPercent}
                      onChange={(e) => setSwapParams({...swapParams, stopLossPercent: parseFloat(e.target.value)})}
                      placeholder="输入止损比例 (0.00-1.00)"
                      step="0.01"
                      min="0"
                      max="1"
                      className="bg-white"
                    />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="maxSlippage" className="block text-sm font-medium text-gray-700 mb-1">
                  最大滑点
                </label>
                <Input
                  id="maxSlippage"
                  type="number"
                  value={swapParams.maxSlippage}
                  onChange={(e) => setSwapParams({...swapParams, maxSlippage: parseFloat(e.target.value)})}
                  placeholder="输入最大滑点  (0.00-1.00)"
                  step="0.01"
                  min="0"
                  max="1"
                  className="bg-white"
                  required
                />
              </div>
              {['solana', 'ethereum'].includes(swapParams.chain) && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="jitoEnabled"
                    checked={swapParams.jitoEnabled}
                    onCheckedChange={(checked) => setSwapParams({...swapParams, jitoEnabled: checked as boolean})}
                  />
                  <label
                    htmlFor="jitoEnabled"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    启用防夹模式
                  </label>
                </div>
              )}
              {swapParams.chain === 'solana' && swapParams.jitoEnabled && (
                <div>
                  <label htmlFor="jitoTip" className="block text-sm font-medium text-gray-700 mb-1">
                    防夹模式贿赂费 (SOL)
                  </label>
                  <Input
                    id="jitoTip"
                    type="number"
                    value={swapParams.jitoTip}
                    onChange={(e) => setSwapParams({...swapParams, jitoTip: parseFloat(e.target.value)})}
                    placeholder="输入防夹模式贿赂费"
                    step="0.000001"
                    min="0"
                    className="bg-white"
                  />
                </div>
              )}
              {swapParams.chain === 'solana' && (
                <div>
                  <label htmlFor="priorityFee" className="block text-sm font-medium text-gray-700 mb-1">
                    优先费 (SOL)
                  </label>
                  <Input
                    id="priorityFee"
                    type="text"
                    value={swapParams.priorityFee}
                    onChange={(e) => setSwapParams({...swapParams, priorityFee: e.target.value})}
                    placeholder="输入优先费（留空表示使用自动优先费）"
                    className="bg-white"
                  />
                </div>
              )}
              {['base', 'bsc', 'ethereum', 'arbitrum'].includes(swapParams.chain) && (
                <>
                  <div>
                    <label htmlFor="gasFeeDelta" className="block text-sm font-medium text-gray-700 mb-1">
                      额外增加的gas (Gwei)
                    </label>
                    <Input
                      id="gasFeeDelta"
                      type="number"
                      value={swapParams.gasFeeDelta}
                      onChange={(e) => setSwapParams({...swapParams, gasFeeDelta: parseFloat(e.target.value)})}
                      placeholder="输入额外增加的gas"
                      step="1"
                      min="0"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxFeePerGas" className="block text-sm font-medium text-gray-700 mb-1">
                      愿意支付的最大gas (Gwei)
                    </label>
                    <Input
                      id="maxFeePerGas"
                      type="number"
                      value={swapParams.maxFeePerGas}
                      onChange={(e) => setSwapParams({...swapParams, maxFeePerGas: parseFloat(e.target.value)})}
                      placeholder="输入愿意支付的最大gas"
                      step="1"
                      min="0"
                      className="bg-white"
                    />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="concurrentNodes" className="block text-sm font-medium text-gray-700 mb-1">
                  并发节点数
                </label>
                <Input
                  id="concurrentNodes"
                  type="number"
                  value={swapParams.concurrentNodes}
                  onChange={(e) => setSwapParams({...swapParams, concurrentNodes: parseInt(e.target.value)})}
                  placeholder="输入并发节点数 (1-3)"
                  step="1"
                  min="1"
                  max="3"
                  className="bg-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="retries" className="block text-sm font-medium text-gray-700 mb-1">
                  失败后的重试次数
                </label>
                <Input
                  id="retries"
                  type="number"
                  value={swapParams.retries}
                  onChange={(e) => setSwapParams({...swapParams, retries: parseInt(e.target.value)})}
                  placeholder="输入重试次数 (0-10)"
                  step="1"
                  min="0"
                  max="10"
                  className="bg-white"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !swapParams.walletId} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  "提交交易订单"
                )}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-center text-sm text-gray-500">
        请妥善保管您的私钥，不要与他人分享。
      </CardFooter>
    </Card>
  )
}