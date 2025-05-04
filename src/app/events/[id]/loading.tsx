export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Hero section skeleton */}
        <div className="w-full h-[50vh] bg-gray-300 mb-8"></div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column */}
          <div className="lg:w-2/3">
            <div className="bg-gray-100 p-6 rounded-lg mb-8">
              <div className="h-8 bg-gray-300 w-1/3 mb-4"></div>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="h-20 bg-gray-300 w-full md:w-1/3"></div>
                <div className="h-20 bg-gray-300 w-full md:w-1/3"></div>
                <div className="h-20 bg-gray-300 w-full md:w-1/3"></div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="h-8 bg-gray-300 w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-200"></div>
            </div>
          </div>
          
          {/* Right column */}
          <div className="lg:w-1/3">
            <div className="bg-gray-100 p-6 rounded-lg">
              <div className="h-8 bg-gray-300 w-1/3 mb-4"></div>
              <div className="h-10 bg-gray-300 w-1/2 mb-6"></div>
              <div className="h-12 bg-gray-400 w-full rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}