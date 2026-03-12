export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Design Gallery</h1>
          <p className="mt-4 text-lg text-gray-600">
            Browse and customize featured designs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                <p className="text-gray-400">Design {item}</p>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">Design Title</h3>
                <p className="text-sm text-gray-600 mt-1">₹599</p>
                <button className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800">
                  Customize
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}