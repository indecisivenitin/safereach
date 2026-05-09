// import { useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { useAlert } from '../../context/AlertContext';
// import { alertService } from '../../services/api';
// import useGeolocation from '../../hooks/useGeolocation';
// import SOSButton from '../../components/SOSButton';
// import { WomanNav } from '../../components/BottomNav';
// import toast from 'react-hot-toast';

// export default function WomanHome() {
//   const { user } = useAuth();
//   const { activeAlert, status, dispatch } = useAlert();
//   const navigate = useNavigate();
//   const { location, error: geoError, loading: geoLoading } = useGeolocation();
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);
//   const messageRef = useRef();

//   const handleSOS = async () => {
//     if (geoLoading) return toast.error('Still acquiring your location, please wait...');
//     if (geoError || !location) return toast.error('Cannot get your location. Please enable GPS.');

//     setLoading(true);
//     try {
//       const { data } = await alertService.create({
//         message: message.trim() || 'SOS! I need immediate help.',
//         coordinates: location.coordinates,
//         address: '',
//       });
//       dispatch({ type: 'ALERT_CREATED', payload: data.alert });
//       toast.success(`🆘 Alert sent! ${data.volunteersNotified} volunteer(s) notified.`);
//       navigate(`/alert/${data.alert._id}`);
//     } catch (err) {
//       toast.error(err.message || 'Failed to send alert. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const firstName = user?.name?.split(' ')[0] || 'there';
//   const hour = new Date().getHours();
//   const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

//   return (
//     <div className="min-h-screen bg-gray-50 pb-24">
//       {/* Header */}
//       <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-xs text-gray-500 font-medium">{greeting}</p>
//             <h1 className="text-xl font-bold text-gray-900">{firstName} 👋</h1>
//           </div>
//           <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
//             <div className={`w-2 h-2 rounded-full ${location ? 'bg-green-500' : 'bg-amber-400'} animate-pulse`} />
//             <span className="text-xs font-medium text-green-700">
//               {geoLoading ? 'Locating...' : location ? 'GPS Active' : 'No GPS'}
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="px-5 space-y-5 pt-6">
//         {/* Safety status card */}
//         <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">🟢</div>
//             <div>
//               <p className="text-sm font-semibold text-green-800">You are safe</p>
//               <p className="text-xs text-green-600">Tap SOS below if you need help</p>
//             </div>
//           </div>
//         </div>

//         {/* SOS Button */}
//         <div className="card flex flex-col items-center py-8 gap-4">
//           <SOSButton onTrigger={handleSOS} disabled={status !== 'idle' || loading} loading={loading} />

//           {/* Message input */}
//           <div className="w-full mt-2">
//             <div className="flex gap-2 items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
//               <span className="text-gray-400 text-sm">💬</span>
//               <input
//                 ref={messageRef}
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 placeholder="Add a message (optional)..."
//                 maxLength={150}
//                 className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
//               />
//               {message && (
//                 <button onClick={() => setMessage('')} className="text-gray-400 text-xs">✕</button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Location info */}
//         {location && (
//           <div className="card flex items-center gap-3">
//             <span className="text-xl">📍</span>
//             <div className="flex-1 min-w-0">
//               <p className="text-xs font-semibold text-gray-700">Your location is ready</p>
//               <p className="text-xs text-gray-400 truncate">
//                 {location.lat.toFixed(5)}, {location.lng.toFixed(5)} · ±{Math.round(location.accuracy)}m accuracy
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Tips */}
//         <div className="space-y-2">
//           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">Safety tips</p>
//           {[
//             { icon: '📞', tip: 'Save emergency contacts in your profile' },
//             { icon: '🔔', tip: 'Allow notifications for volunteer updates' },
//             { icon: '📍', tip: 'Keep GPS enabled at all times' },
//           ].map(({ icon, tip }) => (
//             <div key={tip} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
//               <span>{icon}</span>
//               <p className="text-xs text-gray-600">{tip}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       <WomanNav />
//     </div>
//   );
// }

//chatgpt//

// import { useState } from 'react';
// import { toast } from 'react-hot-toast';

// import SOSButton from '../../components/SOSButton';
// // import { useAlerts } from '../../context/AlertContext';
// //chatgpt//
// import { useAlert } from '../../context/AlertContext';

// // import { useGeolocation } from '../../hooks/useGeolocation';
// //chatgpt//
// import useGeolocation from '../../hooks/useGeolocation';
// import { alertService } from '../../services/api';

// const WomanHome = () => {
//   const [message, setMessage] = useState('');
//   const { location, loading } = useGeolocation();
//   // const { setActiveAlert } = useAlerts();
//   //chatgpt//
//   const { dispatch } = useAlert();

//   const handleSOS = async () => {
//     try {
//       if (!location) {
//         toast.error('Location not available');
//         return;
//       }

//       // IMPORTANT FIX
//       // Backend expects: [lng, lat]
//       const coordinates = [location.lng, location.lat];

//       const { data } = await alertService.create({
//         message: message.trim() || 'SOS! I need immediate help.',
//         coordinates,
//         address: '',
//       });

//       // setActiveAlert(data.data.alert);
//       //chatgpt//
//       dispatch({
//         type: 'ALERT_CREATED',
//         payload: data.alert
//       });
//       toast.success('SOS Alert sent successfully');
//     } catch (err) {
//       console.error(err);

//       // IMPORTANT FIX
//       toast.error(
//         err.response?.data?.message ||
//         err.message ||
//         'Failed to send alert. Please try again.'
//       );
//     }
//   };

//   return (
//     <div className="p-4">
//       <div className="mb-4">
//         <textarea
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Describe your emergency..."
//           className="w-full p-3 border rounded-lg"
//           rows={4}
//         />
//       </div>

//       <SOSButton
//         onTrigger={handleSOS}
//         disabled={loading || !location}
//       />

//       {location && (
//         <div className="mt-4 text-sm text-gray-500">
//           <p>Latitude: {location.lat}</p>
//           <p>Longitude: {location.lng}</p>
//           <p>Accuracy: {location.accuracy}m</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default WomanHome;






















import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

import { alertService } from '../../services/api';

import useGeolocation from '../../hooks/useGeolocation';

import SOSButton from '../../components/SOSButton';
import { WomanNav } from '../../components/BottomNav';

import toast from 'react-hot-toast';

export default function WomanHome() {

  const { user } = useAuth();

  const {
    activeAlert,
    status,
    dispatch
  } = useAlert();

  const navigate = useNavigate();

  const {
    location,
    error: geoError,
    loading: geoLoading
  } = useGeolocation();

  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);

  const messageRef = useRef();

  // =====================================================
  // HANDLE SOS
  // =====================================================

  const handleSOS = async () => {

    if (geoLoading) {
      return toast.error(
        'Still acquiring your location, please wait...'
      );
    }

    if (geoError || !location) {
      return toast.error(
        'Cannot get your location. Please enable GPS.'
      );
    }

    setLoading(true);

    try {

      // IMPORTANT FIX:
      // Backend expects [lng, lat]
      const coordinates = [
        location.lng,
        location.lat
      ];

      const { data } = await alertService.create({

        message:
          message.trim() ||
          'SOS! I need immediate help.',

        coordinates,

        address: '',
      });

      // =================================================
      // UPDATE CONTEXT
      // =================================================

      dispatch({
        type: 'ALERT_CREATED',
        payload: data.alert
      });

      toast.success(
        `🆘 Alert sent! ${data.volunteersNotified} volunteer(s) notified.`
      );

      navigate(`/alert/${data.alert._id}`);

    } catch (err) {

      console.error(err);

      toast.error(

        err.response?.data?.message ||

        err.message ||

        'Failed to send alert. Please try again.'
      );

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // GREETING
  // =====================================================

  const firstName =
    user?.name?.split(' ')[0] || 'there';

  const hour =
    new Date().getHours();

  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 17
        ? 'Good afternoon'
        : 'Good evening';

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="min-h-screen bg-gray-50 pb-24">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs text-gray-500 font-medium">
              {greeting}
            </p>

            <h1 className="text-xl font-bold text-gray-900">
              {firstName} 👋
            </h1>

          </div>

          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">

            <div
              className={`w-2 h-2 rounded-full ${
                location
                  ? 'bg-green-500'
                  : 'bg-amber-400'
              } animate-pulse`}
            />

            <span className="text-xs font-medium text-green-700">

              {geoLoading
                ? 'Locating...'
                : location
                  ? 'GPS Active'
                  : 'No GPS'}

            </span>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="px-5 space-y-5 pt-6">

        {/* ============================================= */}
        {/* SAFETY CARD */}
        {/* ============================================= */}

        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">
              🟢
            </div>

            <div>

              <p className="text-sm font-semibold text-green-800">
                You are safe
              </p>

              <p className="text-xs text-green-600">
                Tap SOS below if you need help
              </p>

            </div>

          </div>

        </div>

        {/* ============================================= */}
        {/* SOS CARD */}
        {/* ============================================= */}

        <div className="card flex flex-col items-center py-8 gap-4">

          <SOSButton
            onTrigger={handleSOS}
            disabled={
              status !== 'idle' ||
              loading
            }
            loading={loading}
          />

          {/* ========================================= */}
          {/* MESSAGE INPUT */}
          {/* ========================================= */}

          <div className="w-full mt-2">

            <div className="flex gap-2 items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">

              <span className="text-gray-400 text-sm">
                💬
              </span>

              <input
                ref={messageRef}

                value={message}

                onChange={(e) =>
                  setMessage(e.target.value)
                }

                placeholder="Add a message (optional)..."

                maxLength={150}

                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />

              {message && (

                <button
                  onClick={() => setMessage('')}
                  className="text-gray-400 text-xs"
                >
                  ✕
                </button>

              )}

            </div>

          </div>

        </div>

        {/* ============================================= */}
        {/* LOCATION CARD */}
        {/* ============================================= */}

        {location && (

          <div className="card flex items-center gap-3">

            <span className="text-xl">
              📍
            </span>

            <div className="flex-1 min-w-0">

              <p className="text-xs font-semibold text-gray-700">
                Your location is ready
              </p>

              <p className="text-xs text-gray-400 truncate">

                {location.lat.toFixed(5)},
                {' '}
                {location.lng.toFixed(5)}
                {' · '}
                ±{Math.round(location.accuracy)}m accuracy

              </p>

            </div>

          </div>

        )}

        {/* ============================================= */}
        {/* SAFETY TIPS */}
        {/* ============================================= */}

        <div className="space-y-2">

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
            Safety tips
          </p>

          {[
            {
              icon: '📞',
              tip: 'Save emergency contacts in your profile'
            },

            {
              icon: '🔔',
              tip: 'Allow notifications for volunteer updates'
            },

            {
              icon: '📍',
              tip: 'Keep GPS enabled at all times'
            },

          ].map(({ icon, tip }) => (

            <div
              key={tip}
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100"
            >

              <span>{icon}</span>

              <p className="text-xs text-gray-600">
                {tip}
              </p>

            </div>

          ))}

        </div>

      </div>

      {/* ================================================= */}
      {/* BOTTOM NAV */}
      {/* ================================================= */}

      <WomanNav />

    </div>
  );
}

