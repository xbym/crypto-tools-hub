"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bitcoin, Wallet, LineChart, Bot, Search, Link, Mail, BookOpen, Bell, Menu } from 'lucide-react'
import ContactAuthor from '@/components/ContactAuthor'
import ImportantAnnouncements from '@/components/ImportantAnnouncements'
import Logo from '@/components/Logo'

const categories = [
  { name: '全部', icon: <Search className="w-6 h-6" /> },
  { name: '必备软件', icon: <Bitcoin className="w-6 h-6" /> },
  { name: '常用钱包', icon: <Wallet className="w-6 h-6" /> },
  { name: '二级看线工具', icon: <LineChart className="w-6 h-6" /> },
  { name: '一级市场机器人', icon: <Bot className="w-6 h-6" /> },
  { name: '进大群免费教学', icon: <BookOpen className="w-6 h-6" /> },
  { name: '重要提醒', icon: <Bell className="w-6 h-6" /> },
  { name: '联系作者', icon: <Mail className="w-6 h-6" /> },
]

const initialTools = [
  { id: '1', name: 'Metamask', description: '以太坊生态系统的主流浏览器插件钱包。支持ERC20代币和DApp交互。', category: '常用钱包', installLink: 'https://metamask.io/download/' },
  { id: '2', name: '欧意Web3钱包', description: '多链支持的去中心化钱包，提供安全便捷的资产管理。支持以太坊、BSC等多个公链及其代币。', category: '常用钱包', installLink: 'https://www.okx.com/cn/web3' },
  { id: '3', name: 'TradingView', description: '专业的图表分析工具', category: '二级看线工具', installLink: 'https://www.tradingview.com/' },
  { id: '4', name: 'Ave.ai', description: '智能加密货币交易分析平台，支持多个交易所。提供实时市场洞察和交易机会识别。', category: '一级看线工具', installLink: 'https://ave.ai/' },
  { id: '5', name: '快连VPN', description: '安全高速的VPN服务，轻松访问全球网络。', category: '必备软件', installLink: 'https://drive.google.com/file/d/1dxzRW7lbZZB5jco9sxoNGEGpZ3ZMvNQG/view?pli=1' },
  { id: '6', name: 'Discord', description: '加密货币社区交流平台，获取最新资讯和讨论。', category: '必备软件', installLink: 'https://drive.google.com/file/d/1PgqfkCUhXcDNPTreeGRnoFi99swVgEXI/view?usp=sharing' },
  { id: '7', name: '价格追踪器', description: '实时追踪加密货币价格', category: '二级看线工具', installLink: 'https://coinmarketcap.com/' },
  { id: '8', name: 'Dexscreener', description: '多链DEX交易对分析工具，提供实时价格、流动性和交易量数据。支持自定义警报和图表分析功能。', category: '一级看线工具', installLink: 'https://dexscreener.com/' },
  { id: '12', name: 'Telegram', description: '加密货币信息交流的即时通讯平台。获取实时市场动态和项目更新。', category: '必备软件', installLink: 'https://drive.google.com/file/d/1uo57kaCJygKcOdewLUnaWAwrLvX-Lsd-/view?usp=drive_link' },
  { id: '13', name: 'Unisat钱包', description: '专注于比特币生态系统的Web3钱包。支持BRC20代币和铭文交易。', category: '常用钱包', installLink: 'https://unisat.io/download' },
  { id: '14', name: 'wizz钱包', description: '支持多链的轻量级Web3钱包，专注于用户体验。提供简洁界面和快速交易功能。', category: '常用钱包', installLink: 'https://www.wizz.wallet/' },
  { id: '15', name: 'Phantom钱包', description: 'Solana生态系统的主流Web3钱包。支持SOL及SPL代币管理、NFT收藏和DApp交互。', category: '常用钱包', installLink: 'https://phantom.app/' },
]

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  installLink: string;
}

export default function CryptoToolsHub() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [tools] = useState<Tool[]>(initialTools)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const filteredTools = tools.filter(tool => 
    (activeCategory === '全部' || tool.category === activeCategory) &&
    (tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     tool.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => a[sortBy as keyof Tool].localeCompare(b[sortBy as keyof Tool]))

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 text-gray-800">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex items-center justify-between border-b border-gray-200">
        <Logo />
        <Button variant="ghost" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white shadow-md`}>
        <div className="p-4 hidden md:flex items-center">
          <Logo />
          <h1 className="text-2xl font-bold text-blue-600 ml-2">币用宝</h1>
        </div>
        <nav className="mt-4">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={activeCategory === category.name ? "default" : "ghost"}
              className={`w-full justify-start gap-2 px-4 py-2 text-left ${
                activeCategory === category.name ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => {
                setActiveCategory(category.name)
                setIsSidebarOpen(false)
              }}
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 md:p-8 overflow-auto bg-gray-50">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-600">{activeCategory}</h2>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {activeCategory !== '联系作者' && activeCategory !== '重要提醒' && (
              <>
                <Input
                  placeholder="搜索工具..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 bg-white text-gray-800 border-gray-300 focus:border-blue-500"
                />
                <Select 
                  value={sortBy} 
                  onValueChange={(value: string) => setSortBy(value)}
                >
                  <SelectTrigger className="w-full md:w-[180px] bg-white text-gray-800 border-gray-300">
                    <SelectValue placeholder="排序方式" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-800 border-gray-300">
                    <SelectItem value="name">按名称</SelectItem>
                    <SelectItem value="category">按类别</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
        {activeCategory === '联系作者' ? (
          <ContactAuthor />
        ) : activeCategory === '重要提醒' ? (
          <ImportantAnnouncements />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <Card key={tool.id} className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-blue-600">{tool.name}</CardTitle>
                  <CardDescription className="text-gray-600">{tool.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700">{tool.description}</CardDescription>
                  <div className="mt-4 flex justify-between">
                    <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                      <a href={tool.installLink} target="_blank" rel="noopener noreferrer">
                        <Link className="mr-2 h-4 w-4" /> 官网
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}