

// import { useEffect, useRef } from 'react';
// import { useSocket } from '../context/SocketContext';
// // import { volunteerService } from '../services/api';

// const BROADCAST_INTERVAL = 5000;

// const useLocationBroadcast = ({
//   enabled,
//   alertId
// }) => {

//   const { emit } = useSocket();

//   const intervalRef = useRef(null);

//   useEffect(() => {

//     if (!enabled) return;

//     if (!navigator.geolocation) return;

//     const broadcastLocation = () => {

//   console.log("📍 Attempting location fetch...");

//   navigator.geolocation.getCurrentPosition(

//     async (position) => {

//       console.log("✅ REAL GPS:", {
//         latitude: position.coords.latitude,
//         longitude: position.coords.longitude
//       });

//       const coordinates = [
//         position.coords.longitude,
//         position.coords.latitude
//       ];

//       console.log(
//         "🚀 EMITTING volunteer:location-update",
//         coordinates
//       );

//       emit(
//         'volunteer:location-update',
//         {
//           coordinates,
//           alertId
//         }
//       );
//     },

//     (err) => {

//       console.log(
//         '❌ Location access error:',
//         err
//       );
//     },

//     {
//       enableHighAccuracy: true,
//       timeout: 10000,
//       maximumAge: 3000
//     }
//   );
// };
//     // Immediate update

//     broadcastLocation();

//     // Continuous updates

//     intervalRef.current = setInterval(
//       broadcastLocation,
//       BROADCAST_INTERVAL
//     );

//     return () => {

//       if (intervalRef.current) {

//         clearInterval(intervalRef.current);
//       }
//     };

//   }, [enabled, alertId]);
// };

// export default useLocationBroadcast;









import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const useLocationBroadcast = ({ enabled, alertId }) => {

  const { emit } = useSocket();
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const lastCoordsRef = useRef(null);

  useEffect(() => {

    if (!enabled) return;

    if (!navigator.geolocation) {
      console.warn('❌ Geolocation not supported');
      return;
    }

    const broadcast = (coordinates) => {
      lastCoordsRef.current = coordinates;
      console.log('🚀 EMITTING volunteer:location-update', coordinates);
      emit('volunteer:location-update', { coordinates, alertId });
    };

    // Use watchPosition for real continuous GPS — NOT getCurrentPosition
    // maximumAge:0 forces fresh GPS reading every time (no cache)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        console.log('✅ REAL GPS:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });

        const coordinates = [
          position.coords.longitude,
          position.coords.latitude
        ];

        broadcast(coordinates);
      },
      (err) => {
        console.warn('❌ GPS watch error:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0   // ← No cache — always fresh GPS
      }
    );

    // Also emit every 5s in case watchPosition doesn't fire (some browsers throttle)
    intervalRef.current = setInterval(() => {
      if (lastCoordsRef.current) {
        broadcast(lastCoordsRef.current);
      }
    }, 5000);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

  }, [enabled, alertId, emit]);
};

export default useLocationBroadcast;