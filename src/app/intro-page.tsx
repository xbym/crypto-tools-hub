'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function IntroPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const inviteParam = searchParams.get('invite')
    if (inviteParam) {
      router.push(`/home?invite=${inviteParam}`)
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 p-4">
      <Card className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px] shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-indigo-800">欢迎来到币用宝</CardTitle>
          <CardDescription className="text-center text-gray-600 text-base md:text-lg">JH投研社倾力打造的币圈小白成长助手</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <p className="text-center text-gray-700 text-sm md:text-base">
            币用宝为您提供全方位的加密货币学习和投资工具，助您在WEB3世界中游刃有余。
          </p>
          <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2">
            <li>✅ WEB3必备工具导航</li>
            <li>✅ 主流钱包使用指南</li>
            <li>✅ 二级市场专业看线软件</li>
            <li>✅ 一级市场智能冲土狗机器人</li>
            <li>✅ 深度科学家进阶课程</li>
            <li>✅ 空投猎手进阶攻略</li>
          </ul>
          <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600">
            <p>🔔 获取JH投研社的免费优质资讯</p>
            <p>🗣️ 加入免费社群，与志同道合者交流</p>
            <p>🚀 深度投资学习，请联系作者</p>
          </div>
          <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-base md:text-lg py-4 md:py-6">
            <Link href="/home">开启您的加密之旅</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}