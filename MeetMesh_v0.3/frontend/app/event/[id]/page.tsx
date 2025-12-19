import { Suspense } from 'react'
import { EventContent } from './EventContent'
import { SkeletonLoader } from '@/components/SkeletonLoaders'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BackgroundEffects } from '@/components/BackgroundEffects'

export default function EventPage({ params }: { params: { id: string } }) {
  return (
    <div className="relative min-h-screen dynamic-bg">
      <BackgroundEffects />
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Suspense fallback={<SkeletonLoader />}>
        <EventContent eventId={params.id} />
      </Suspense>
    </div>
  )
}