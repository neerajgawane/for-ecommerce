export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About FOR</h1>

        <div className="prose prose-lg">
          <p className="text-gray-600 leading-relaxed">
            FOR is a custom t-shirt design platform that empowers you to create
            unique apparel that tells your story. With our AI-powered design tools
            and virtual try-on technology, designing custom t-shirts has never been easier.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            We believe everyone has a story to tell, and we are here to help you wear it.
            Our mission is to democratize custom apparel design and make it accessible
            to everyone, regardless of design experience.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>AI-powered design generation</li>
            <li>Virtual try-on before you buy</li>
            <li>100% premium quality materials</li>
            <li>Fast shipping across India</li>
            <li>Easy returns and exchanges</li>
          </ul>
        </div>
      </div>
    </div>
  );
}