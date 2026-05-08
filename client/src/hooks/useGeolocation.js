import { useState, useEffect, useCallback } from 'react';

const useGeolocation = ({ watch = false, onUpdate } = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 };

  const handleSuccess = useCallback((pos) => {
    const loc = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      coordinates: [pos.coords.longitude, pos.coords.latitude],
    };
    setLocation(loc);
    setError(null);
    setLoading(false);
    onUpdate?.(loc);
  }, [onUpdate]);

  const handleError = useCallback((err) => {
    setError(err.message);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    let watchId;
    if (watch) {
      watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
    } else {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [watch]);

  const refresh = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  };

  return { location, error, loading, refresh };
};

export default useGeolocation;
