import { Sprout } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4">
      <div className="relative">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
          <Sprout className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-500 rounded-full border-t-transparent animate-spin opacity-40"></div>
      </div>
      <div className="text-center">
        <h3 className="text-emerald-900 font-bold tracking-tight">Kishan Seva</h3>
        <p className="text-xs text-emerald-600/70 font-medium">Loading modules...</p>
      </div>
    </div>
  );
}
