import React from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import Image from 'next/image'

interface Announcement {
  id: string;
  date: string;
  content: string;
  imageUrl?: string;
}

const announcements: Announcement[] = [
  /*{
    id: '1',
    date: '2024-03-10 14:30',
    content: '比特币价格突破70,000美元，创下历史新高。这标志着加密货币市场的又一个里程碑。',
    imageUrl: '/placeholder.svg?height=200&width=400'
  },*/
]

const AnnouncementBubble: React.FC<Announcement> = ({ date, content, imageUrl }) => (
  <div className="mb-4 flex">
    <Image
      src="https://ui-avatars.com/api/?name=管理员&background=random"
      alt="管理员头像"
      width={40}
      height={40}
      className="rounded-full mr-3 flex-shrink-0"
    />
    <div>
      <div className="text-xs text-gray-500 mb-1">{date}</div>
      <div className="bg-blue-100 p-2 md:p-3 rounded-lg inline-block max-w-[80%]">
        <p className="text-gray-800 text-sm md:text-base mb-2">{content}</p>
        {imageUrl && (
          <Image
            src={imageUrl}
            alt="公告图片"
            width={500}
            height={300}
            layout="responsive"
            className="rounded-md"
          />
        )}
      </div>
    </div>
  </div>
)

export default function ImportantAnnouncements() {
  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* 顶部导航栏 */}
      <div className="bg-white p-3 md:p-4 flex items-center border-b border-gray-200">
        <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-600 mr-3 md:mr-4" />
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">重要提醒</h2>
      </div>

      {/* 聊天区域 */}
      <div className="flex-grow p-3 md:p-4 overflow-y-auto">
        {announcements.map((announcement) => (
          <AnnouncementBubble key={announcement.id} {...announcement} />
        ))}
      </div>

      {/* 底部输入区域 */}
      <div className="bg-white p-3 md:p-4 border-t border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-full p-2">
          <input
            type="text"
            className="flex-grow bg-transparent outline-none text-gray-600 placeholder-gray-500 text-sm md:text-base"
            placeholder="已开启仅管理员可发言"
            disabled
          />
          <Send className="h-5 w-5 md:h-6 md:w-6 text-gray-400 ml-2" />
        </div>
      </div>
    </div>
  )
}