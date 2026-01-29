import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from 'lucide-react';

export default function BookingInterfaceSkeleton() {
  return (
    <Card className="w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden bg-white/30 backdrop-blur-lg border-white/20">
      <div className="p-6 sm:p-8">
        <div className='flex justify-between items-start mb-6 -mt-2'>
            <div>
                <Skeleton className="h-9 w-80 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>
             <div className="text-right">
                <p className="text-sm font-bold text-gray-600 flex items-center gap-2 justify-end"><Users className="h-4 w-4" /> Total Registered</p>
                <Skeleton className="h-9 w-20 mt-1 mx-auto" />
            </div>
        </div>
        
        {/* Date Skeleton */}
        <div className='space-y-4 mb-6'>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-10 w-full sm:w-[280px]" />
        </div>

        {/* Ghat Skeleton */}
        <div className='space-y-4 mb-6'>
            <Skeleton className="h-7 w-40" />
            <div className='flex flex-wrap gap-3'>
                <Skeleton className="h-[54px] w-[180px] rounded-lg" />
                <Skeleton className="h-[54px] w-[180px] rounded-lg" />
                <Skeleton className="h-[54px] w-[180px] rounded-lg" />
            </div>
        </div>
      </div>
    </Card>
  )
}
