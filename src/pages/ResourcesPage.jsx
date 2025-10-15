import React from 'react';

const ResourcesPage = () => {
  const resources = [
    {
      title: 'Natural Farming Guide',
      description: 'A comprehensive guide to natural farming practices and techniques.',
      category: 'Guide',
      downloadUrl: '#'
    },
    {
      title: 'Soil Health Assessment',
      description: 'Tools and methods for assessing and improving soil health.',
      category: 'Tool',
      downloadUrl: '#'
    },
    {
      title: 'Crop Planning Calendar',
      description: 'Seasonal planning guide for different crops and regions.',
      category: 'Planning',
      downloadUrl: '#'
    },
    {
      title: 'Pest Management',
      description: 'Natural methods for managing pests and diseases.',
      category: 'Guide',
      downloadUrl: '#'
    }
  ];

  return (
    <div className="bg-green-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-green-800 mb-8">Resources</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <span className="inline-block px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full mb-2">
                  {resource.category}
                </span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {resource.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {resource.description}
                </p>
                <a
                  href={resource.downloadUrl}
                  className="inline-flex items-center text-green-600 hover:text-green-700"
                >
                  Download Resource
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-6">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            Our team of experts is here to help you with any questions about natural farming practices.
          </p>
          <button className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;