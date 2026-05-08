// import { useEffect, useRef } from 'react';
// import { useSocket } from '../context/SocketContext';
// import { volunteerService } from '../services/api';

// const BROADCAST_INTERVAL = 8000; // 8 seconds

// const useLocationBroadcast = ({ enabled, alertId }) => {
//   const { emit } = useSocket();
//   const intervalRef = useRef(null);

//   useEffect(() => {
//     if (!enabled || !navigator.geolocation) return;

//     const broadcast = () => {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           const coords = [pos.coords.longitude, pos.coords.latitude];
//           emit('volunteer:location-update', { coordinates: coords, alertId });
//           volunteerService.updateLocation({ coordinates: coords }).catch(() => {});
//         },
//         (err) => console.warn('Location broadcast error:', err.message),
//         { enableHighAccuracy: true, timeout: 5000, maximumAge: 3000 }
//       );
//     };

//     broadcast(); // Immediate first broadcast
//     intervalRef.current = setInterval(broadcast, BROADCAST_INTERVAL);

//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [enabled, alertId, emit]);
// };

// export default useLocationBroadcast;












import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
// import { volunteerService } from '../services/api';

const BROADCAST_INTERVAL = 5000;

const useLocationBroadcast = ({
  enabled,
  alertId
}) => {

  const { emit } = useSocket();

  const intervalRef = useRef(null);

  useEffect(() => {

    if (!enabled) return;

    if (!navigator.geolocation) return;

    const broadcastLocation = () => {

  console.log("📍 Attempting location fetch...");

  navigator.geolocation.getCurrentPosition(

    async (position) => {

      console.log("✅ REAL GPS:", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });

      const coordinates = [
        position.coords.longitude,
        position.coords.latitude
      ];

      console.log(
        "🚀 EMITTING volunteer:location-update",
        coordinates
      );

      emit(
        'volunteer:location-update',
        {
          coordinates,
          alertId
        }
      );
    },

    (err) => {

      console.log(
        '❌ Location access error:',
        err
      );
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3000
    }
  );
};
    // Immediate update

    broadcastLocation();

    // Continuous updates

    intervalRef.current = setInterval(
      broadcastLocation,
      BROADCAST_INTERVAL
    );

    return () => {

      if (intervalRef.current) {

        clearInterval(intervalRef.current);
      }
    };

  }, [enabled, alertId]);
};

export default useLocationBroadcast;