import { Suspense } from 'react'
import { EventContent } from './EventContent'
import { EventPageSkeleton } from '@/components/SkeletonLoaders'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BackgroundEffects } from '@/components/BackgroundEffects'

export default function EventPage({ params }: { params: { id: string } }) {
  return (
    <div className="relative min-h-screen dynamic-bg">
      <BackgroundEffects />
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {/* 结论：添加 relative z-10 确保内容在背景之上 */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Suspense fallback={<EventPageSkeleton />}>
          <EventContent eventId={params.id} />
        </Suspense>
      </div>
    </div>
  )
}