import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <div className="fixed top-5 p-4 h-16 mb-44 left-6 z-50">
      <Link to="/" className={`text-5xl font-sans transition-colors duration-300 ease-in-out`}>
        Ecobites
      </Link>
    </div>
  );
};

export default Logo;