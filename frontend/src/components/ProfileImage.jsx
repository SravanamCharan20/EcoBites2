/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFMkU4RjAiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5NEEzQjgiLz4KICA8cGF0aCBkPSJNMTYwIDE3NS42QzE2MCAxNTAuMjk5IDE0MC43MDEgMTMwIDExNS40IDEzMEg4NC42QzU5LjI5ODggMTMwIDQwIDE1MC4yOTkgNDAgMTc1LjZWMTgwSDg0LjZIMTE1LjRIMTYwVjE3NS42WiIgZmlsbD0iIzk0QTNCOCIvPgo8L3N2Zz4K';

const ProfileImage = ({ 
  src, 
  alt = "Profile", 
  className = "", 
  size = "medium",
  fallbackImage = DEFAULT_AVATAR 
}) => {
  const [imgSrc, setImgSrc] = useState(fallbackImage);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('ProfileImage: Source changed:', { src, fallbackImage });
    // Reset states when src changes
    setIsLoading(true);
    setHasError(false);

    if (!src || src === '/default-profile-pic.jpg') {
      console.log('ProfileImage: Using default avatar');
      setImgSrc(DEFAULT_AVATAR);
      setIsLoading(false);
      return;
    }

    // Preload image
    const img = new Image();
    // Only add cache busting for non-blob URLs
    const imageUrl = src.startsWith('blob:') ? src : src.includes('?') ? src : `${src}?t=${Date.now()}`;
    console.log('ProfileImage: Attempting to load image:', imageUrl);
    
    img.onload = () => {
      console.log('ProfileImage: Image loaded successfully:', imageUrl);
      setImgSrc(imageUrl);
      setIsLoading(false);
    };

    img.onerror = (error) => {
      console.error('ProfileImage: Error loading image:', {
        src: imageUrl,
        error: error,
        fallbackUsed: DEFAULT_AVATAR,
        isBlob: imageUrl.startsWith('blob:')
      });
      setImgSrc(DEFAULT_AVATAR);
      setHasError(true);
      setIsLoading(false);
    };

    img.src = imageUrl;

    // Cleanup
    return () => {
      console.log('ProfileImage: Cleaning up image load listeners');
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-10 h-10",
    large: "w-32 h-32"
  };

  const baseClasses = "rounded-full object-cover transition-opacity duration-300";
  const sizeClass = sizeClasses[size] || sizeClasses.medium;
  const opacityClass = isLoading ? "opacity-50" : "opacity-100";

  return (
    <div className={`relative ${sizeClass}`}>
      <img
        src={imgSrc}
        alt={alt}
        className={`${baseClasses} ${sizeClass} ${opacityClass} ${className}`}
        onError={(e) => {
          console.error('ProfileImage: Runtime image error:', {
            attemptedSrc: imgSrc,
            fallbackImage: DEFAULT_AVATAR,
            hasError: hasError,
            isBlob: imgSrc.startsWith('blob:')
          });
          if (!hasError) {
            setImgSrc(DEFAULT_AVATAR);
            setHasError(true);
          }
        }}
      />
      {isLoading && (
        <div className={`absolute inset-0 ${baseClasses} bg-gray-200 animate-pulse`} />
      )}
    </div>
  );
};

ProfileImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fallbackImage: PropTypes.string
};

export default ProfileImage; 