import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Announcement {
  id: string;
  date: string;
  title: string;
  content: string;
  imageUrl?: string;
}

const initialAnnouncements: Announcement[] = [
  {
    id: '1',
    date: '2024-03-10',
    title: '比特币突破新高！',
    content: '今天，比特币价格突破了70,000美元，创下历史新高。这标志着加密货币市场的又一个里程碑。',
    imageUrl: '/placeholder.svg?height=200&width=400'
  },
  {
    id: '2',
    date: '2024-03-09',
    title: '新的DeFi项目即将上线',
    content: '一个革命性的DeFi项目将于下周上线。该项目承诺提供更高的收益和更低的风险。敬请关注！',
  },
  {
    id: '3',
    date: '2024-03-08',
    title: '本周收益报告',
    content: '本周我们的投资组合取得了显著的增长。总收益率达到15%，主要得益于几个关键的代币表现。',
    imageUrl: '/placeholder.svg?height=300&width=500'
  },
]

export default function ImportantAnnouncements() {
  const [announcements] = useState<Announcement[]>(initialAnnouncements)

  return (
    <div className="space-y-6">
      <p className="text-gray-300">社区长每日分享重要信息和收益图</p>
      <div className="grid gap-6">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-blue-400">{announcement.title}</CardTitle>
              <CardDescription className="text-gray-400">{announcement.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">{announcement.content}</p>
              {announcement.imageUrl && (
                <img 
                  src={announcement.imageUrl} 
                  alt={announcement.title} 
                  className="w-full h-auto rounded-lg"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}