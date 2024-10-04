import { Mail, MessageCircle, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FaQq } from 'react-icons/fa'

export default function ContactAuthor() {
  return (
    <div className="space-y-6">
      <p className="text-gray-700">如果您有任何问题或建议，请随时与我联系。</p>
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-blue-600">联系方式</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 text-blue-500" />
              <p className="text-gray-700">example@email.com</p>
            </div>
            <div className="flex items-center gap-4">
              <FaQq className="h-5 w-5 text-blue-500" />
              <p className="text-gray-700">123456789</p>
            </div>
            <div className="flex items-center gap-4">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <p className="text-gray-700">微信: author_wechat</p>
            </div>
            <div className="flex items-center gap-4">
              <Globe className="h-5 w-5 text-blue-500" />
              <p className="text-gray-700">https://author-website.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}