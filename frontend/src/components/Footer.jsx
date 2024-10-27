import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 rounded-3xl m-5 p-10 text-gray-300 py-16 relative">
      {/* Large Background Icon */}
      <div className="absolute inset-0 z-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 1440 320"
          className="w-full h-full opacity-5"
        >
          <path
            fill="currentColor"
            d="M0,192L48,192C96,192,192,192,288,202.7C384,213,480,235,576,240C672,245,768,235,864,208C960,181,1056,139,1152,138.7C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Footer Content */}
      <div className="relative overflow-hidden h-32 bg-gray-900">
        <h1 className="absolute text-white text-[150px] font-bold leading-none" style={{ bottom: '50%', left: '50%', transform: 'translate(-50%, 50%)' }}>
          Ecobites
        </h1>
      </div>

      {/* Footer Bottom Section */}
      <div className="mt-8 border-t border-gray-700 pt-6 text-sm flex justify-between">
        <span>© Ecobites 2024</span>
        <span>Made by Sravanam Charan</span>
      </div>
    </footer>
  );
};

export default Footer;