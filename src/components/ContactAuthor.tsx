import { Mail, Phone, MessageCircle, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactAuthor() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-400">联系作者</h2>
      <p className="text-gray-300">如果您有任何问题或建议，请随时与我联系。</p>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-400">联系方式</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 text-blue-400" />
              <p className="text-gray-300">example@email.com</p>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="h-5 w-5 text-blue-400" />
              <p className="text-gray-300">+86 123 4567 8900</p>
            </div>
            <div className="flex items-center gap-4">
              <MessageCircle className="h-5 w-5 text-blue-400" />
              <p className="text-gray-300">WeChat: author_wechat</p>
            </div>
            <div className="flex items-center gap-4">
              <Globe className="h-5 w-5 text-blue-400" />
              <p className="text-gray-300">https://author-website.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}