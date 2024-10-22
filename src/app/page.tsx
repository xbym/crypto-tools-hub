import { Suspense } from 'react'
import IntroPage from './intro-page'

export default function Page() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <IntroPage />
    </Suspense>
  )
}