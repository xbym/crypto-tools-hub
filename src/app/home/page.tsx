import { Suspense } from 'react'
import CryptoToolsHub from './crypto-tools-hub'

export default function HomePage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <CryptoToolsHub />
    </Suspense>
  )
}