"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bitcoin, Wallet, LineChart, Bot, Search, Link, Mail, BookOpen, Coins, Zap, Bell, Menu } from 'lucide-react'
import ContactAuthor from '@/components/ContactAuthor'
import ImportantAnnouncements from '@/components/ImportantAnnouncements'
import Logo from '@/components/Logo'

const categories = [
  { name: '全部', icon: <Search className="w-6 h-6" /> },
  { name: '必备软件', icon: <Bitcoin className="w-6 h-6" /> },
  { name: '常用钱包', icon: <Wallet className="w-6 h-6" /> },
  { name: '二级看线工具', icon: <LineChart className="w-6 h-6" /> },
  { name: '一级市场机器人', icon: <Bot className="w-6 h-6" /> },
  { name: '科学家学习', icon: <BookOpen className="w-6 h-6" /> },
  { name: '币圈基础知识', icon: <Coins className="w-6 h-6" /> },
  { name: '空投学习', icon: <Zap className="w-6 h-6" /> },
  { name: '重要提醒', icon: <Bell className="w-6 h-6" /> },
  { name: '联系作者', icon: <Mail className="w-6 h-6" /> },
]

const initialTools = [
  { id: '1', name: '比特币钱包', description: '安全存储比特币', category: '常用钱包', installLink: 'https://bitcoin.org/en/choose-your-wallet' },
  { id: '2', name: '以太坊钱包', description: '管理以太坊和ERC20代币', category: '常用钱包', installLink: 'https://ethereum.org/en/wallets/' },
  { id: '3', name: 'TradingView', description: '专业的图表分析工具', category: '二级看线工具', installLink: 'https://www.tradingview.com/' },
  { id: '4', name: '币安自动交易机器人', description: '在币安上自动交易', category: '一级市场机器人', installLink: 'https://www.binance.com/en/support/faq/how-to-use-binance-trading-bots-5bd149a31f0a4e1f9d5ae6b4a4a14c76' },
  { id: '5', name: '加密货币税务计算器', description: '计算加密货币交易的税务', category: '必备软件', installLink: 'https://koinly.io/' },
  { id: '6', name: '区块浏览器', description: '查看区块链交易详情', category: '必备软件', installLink: 'https://etherscan.io/' },
  { id: '7', name: '价格追踪器', description: '实时追踪加密货币价格', category: '二级看线工具', installLink: 'https://coinmarketcap.com/' },
  { id: '8', name: 'DeFi收益农场机器人', description: '自动化DeFi收益耕作', category: '一级市场机器人', installLink: 'https://yearn.finance/' },
  { id: '9', name: '区块链技术课程', description: '深入学习区块链技术原理', category: '科学家学习', installLink: 'https://www.coursera.org/specializations/blockchain' },
  { id: '10', name: '加密货币入门指南', description: '了解加密货币的基本概念', category: '币圈基础知识', installLink: 'https://www.investopedia.com/terms/c/cryptocurrency.asp' },
  { id: '11', name: '空投跟踪器', description: '获取最新的空投信息', category: '空投学习', installLink: 'https://airdrops.io/' },
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
                        <Link className="mr-2 h-4 w-4" /> 安装
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