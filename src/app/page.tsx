"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bitcoin, Wallet, LineChart, Bot, Search, Plus, Edit, Link, Mail, Phone, MessageCircle, Globe } from 'lucide-react'

const categories = [
  { name: '全部', icon: <Search className="w-6 h-6" /> },
  { name: '必备软件', icon: <Bitcoin className="w-6 h-6" /> },
  { name: '常用钱包', icon: <Wallet className="w-6 h-6" /> },
  { name: '二级看线工具', icon: <LineChart className="w-6 h-6" /> },
  { name: '一级市场机器人', icon: <Bot className="w-6 h-6" /> },
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
  const [tools, setTools] = useState<Tool[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)

  useEffect(() => {
    const savedTools = localStorage.getItem('cryptoTools')
    if (savedTools) {
      setTools(JSON.parse(savedTools))
    } else {
      const initialTools: Tool[] = [
        { id: '1', name: '比特币钱包', description: '安全存储比特币', category: '常用钱包', installLink: 'https://bitcoin.org/en/choose-your-wallet' },
        { id: '2', name: '以太坊钱包', description: '管理以太坊和ERC20代币', category: '常用钱包', installLink: 'https://ethereum.org/en/wallets/' },
        { id: '3', name: 'TradingView', description: '专业的图表分析工具', category: '二级看线工具', installLink: 'https://www.tradingview.com/' },
        { id: '4', name: '币安自动交易机器人', description: '在币安上自动交易', category: '一级市场机器人', installLink: 'https://www.binance.com/en/support/faq/how-to-use-binance-trading-bots-5bd149a31f0a4e1f9d5ae6b4a4a14c76' },
        { id: '5', name: '加密货币税务计算器', description: '计算加密货币交易的税务', category: '必备软件', installLink: 'https://koinly.io/' },
        { id: '6', name: '区块浏览器', description: '查看区块链交易详情', category: '必备软件', installLink: 'https://etherscan.io/' },
        { id: '7', name: '价格追踪器', description: '实时追踪加密货币价格', category: '二级看线工具', installLink: 'https://coinmarketcap.com/' },
        { id: '8', name: 'DeFi收益农场机器人', description: '自动化DeFi收益耕作', category: '一级市场机器人', installLink: 'https://yearn.finance/' },
      ]
      setTools(initialTools)
      localStorage.setItem('cryptoTools', JSON.stringify(initialTools))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cryptoTools', JSON.stringify(tools))
  }, [tools])

  const filteredTools = tools.filter(tool => 
    (activeCategory === '全部' || tool.category === activeCategory) &&
    (tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     tool.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => a[sortBy as keyof Tool].localeCompare(b[sortBy as keyof Tool]))

  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool)
    setIsDialogOpen(true)
  }

  const handleAddTool = () => {
    setEditingTool({
      id: String(Date.now()),
      name: '',
      description: '',
      category: '必备软件',
      installLink: '',
    })
    setIsDialogOpen(true)
  }

  const handleSaveTool = (updatedTool: Tool) => {
    if (editingTool?.id) {
      setTools(tools.map(tool => tool.id === updatedTool.id ? updatedTool : tool))
    } else {
      setTools([...tools, updatedTool])
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-blue-400">币圈工具集</h1>
        </div>
        <nav className="mt-4">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={activeCategory === category.name ? "default" : "ghost"}
              className={`w-full justify-start gap-2 px-4 py-2 text-left ${
                activeCategory === category.name ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setActiveCategory(category.name)}
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto bg-gray-900">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-blue-400">{activeCategory}</h2>
          <div className="flex gap-4">
            <Input
              placeholder="搜索工具..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-gray-800 text-gray-100 border-gray-700 focus:border-blue-500"
            />
            <Select 
              value={sortBy} 
              onValueChange={(value: string) => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px] bg-gray-800 text-gray-100 border-gray-700">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                <SelectItem value="name">按名称</SelectItem>
                <SelectItem value="category">按类别</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddTool} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" /> 添加工具
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  联系作者
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-gray-800 border-gray-700 text-gray-100">
                <div className="grid gap-4">
                  <h3 className="font-medium text-lg">联系方式</h3>
                  <div className="grid grid-cols-[25px_1fr] items-center gap-4">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <p>example@email.com</p>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] items-center gap-4">
                    <Phone className="h-5 w-5 text-blue-400" />
                    <p>+86 123 4567 8900</p>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] items-center gap-4">
                    <MessageCircle className="h-5 w-5 text-blue-400" />
                    <p>WeChat: author_wechat</p>
                  </div>
                  <div className="grid grid-cols-[25px_1fr] items-center gap-4">
                    <Globe className="h-5 w-5 text-blue-400" />
                    <p>https://author-website.com</p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Card key={tool.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-blue-400">{tool.name}</CardTitle>
                <CardDescription className="text-gray-400">{tool.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">{tool.description}</CardDescription>
                <div className="mt-4 flex justify-between">
                  <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                    <a href={tool.installLink} target="_blank" rel="noopener noreferrer">
                      <Link className="mr-2 h-4 w-4" /> 安装
                    </a>
                  </Button>
                  <Button onClick={() => handleEditTool(tool)} variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white">
                    <Edit className="mr-2 h-4 w-4" /> 编辑
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit/Add Tool Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>{editingTool?.id ? '编辑工具' : '添加新工具'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const updatedTool: Tool = {
              id: editingTool?.id || String(Date.now()),
              name: formData.get('name') as string,
              description: formData.get('description') as string,
              category: formData.get('category') as string,
              installLink: formData.get('installLink') as string,
            }
            handleSaveTool(updatedTool)
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">名称</Label>
                <Input id="name" name="name" defaultValue={editingTool?.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">描述</Label>
                <Textarea id="description" name="description" defaultValue={editingTool?.description} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">分类</Label>
                <Select name="category" defaultValue={editingTool?.category}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="installLink" className="text-right">安装链接</Label>
                <Input id="installLink" name="installLink" defaultValue={editingTool?.installLink} className="col-span-3" />
              </div>
            </div>
            <DialogTrigger asChild>
              <Button type="submit">保存</Button>
            </DialogTrigger>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}