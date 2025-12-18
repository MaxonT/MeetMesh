import { CreateEventForm } from '@/components/CreateEventForm';
import { CreateEventFormSkeleton } from '@/components/SkeletonLoaders';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
          MeetMesh
        </h1>
        <p className="text-xl text-gray-600">
          Find the perfect meeting time for everyone
        </p>
      </div>
      
      <Suspense fallback={<CreateEventFormSkeleton />}>
        <CreateEventForm />
      </Suspense>
      
      <div className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold mb-2">Create Event</h3>
            <p className="text-sm text-gray-600">
              Set up your event with dates and times
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="font-semibold mb-2">Share Link</h3>
            <p className="text-sm text-gray-600">
              Send the link to your team members
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="font-semibold mb-2">Find Best Time</h3>
            <p className="text-sm text-gray-600">
              See when everyone is available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
