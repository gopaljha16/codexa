import React, { useState, useEffect } from 'react';

const ImageWithFallback = ({ src, fallback, alt, ...props }) => {
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
    }, [src]);

    const handleError = () => {
        setError(true);
    };

    if (error || !src) {
        return fallback;
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={handleError}
            {...props}
        />
    );
};

export default ImageWithFallback;
