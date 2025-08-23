const About = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Sosyal</h1>
        <p className="text-xl text-gray-600">
          Learn more about our platform and mission
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-600 mb-6">
          Sosyal is designed to provide a modern, user-friendly social platform that connects people 
          through meaningful interactions. We believe in creating an environment where users can 
          express themselves freely while maintaining a respectful and inclusive community.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">React 19</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Redux Toolkit</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-700">Tailwind CSS</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700">React Router DOM</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Modern and responsive design</li>
          <li>State management with Redux Toolkit</li>
          <li>Client-side routing</li>
          <li>Tailwind CSS for styling</li>
          <li>Component-based architecture</li>
          <li>Easy to extend and customize</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
