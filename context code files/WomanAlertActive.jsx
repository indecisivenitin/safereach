
// import { useEffect, useState, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';

// import { useAlert } from '../../context/AlertContext';
// import { useSocket } from '../../context/SocketContext';
// import { alertService } from '../../services/api';
// import LiveMap from '../../components/LiveMap';
// import toast from 'react-hot-toast';

// const STATUS_STEPS = [
//   { key: 'searching', label: 'Searching', icon: '📡', desc: 'Searching for nearby volunteers...' },
//   { key: 'active', label: 'Volunteer Found', icon: '🏃', desc: 'A volunteer accepted your SOS alert' },
//   { key: 'resolved', label: 'Safe', icon: '✅', desc: 'Help has arrived' },
// ];

// export default function WomanAlertActive() {

//   const { id } = useParams();
//   const navigate = useNavigate();

//   const { status, volunteerLocation, volunteerProfile, volunteerResponseMessage, dispatch } = useAlert();
//   const { emit, on, off } = useSocket();

//   const [resolving, setResolving] = useState(false);
//   const [cancelling, setCancelling] = useState(false);
//   const [volunteer, setVolunteer] = useState(null);
//   const [volunteerMessage, setVolunteerMessage] = useState('');
//   const [womanCoords, setWomanCoords] = useState(null);

//   const watchIdRef = useRef(null);
//   const roomJoinedRef = useRef(false);

//   // =====================================================
//   // FETCH ALERT ON MOUNT
//   // Handles case where alert was already accepted before
//   // this page mounted (socket event already fired & missed)
//   // =====================================================

//   useEffect(() => {

//     if (!id) return;

//     alertService.getById(id)
//       .then(({ data }) => {
//         const alert = data.alert;

//         if (!alert) return;

//         // If volunteer already accepted, populate immediately
//         if (alert.volunteer) {
//           setVolunteer(alert.volunteer);
//           if (alert.responseMessage) setVolunteerMessage(alert.responseMessage);

//           // Sync status to context
//           dispatch({
//             type: 'ALERT_ACCEPTED',
//             payload: {
//               volunteer: alert.volunteer,
//               responseMessage: alert.responseMessage || '',
//               acceptedAt: alert.acceptedAt,
//             }
//           });
//         }
//       })
//       .catch((err) => console.warn('Failed to fetch alert:', err));

//   }, [id]);

//   // =====================================================
//   // SYNC FROM CONTEXT (belt + suspenders)
//   // =====================================================

//   useEffect(() => {
//     if (volunteerProfile && !volunteer) setVolunteer(volunteerProfile);
//     if (volunteerResponseMessage && !volunteerMessage) setVolunteerMessage(volunteerResponseMessage);
//   }, [volunteerProfile, volunteerResponseMessage]);

//   // =====================================================
//   // WOMAN LOCATION — watchPosition maximumAge:0
//   // =====================================================

//   useEffect(() => {

//     if (!navigator.geolocation) return;

//     watchIdRef.current = navigator.geolocation.watchPosition(
//       (pos) => {
//         setWomanCoords([pos.coords.latitude, pos.coords.longitude]);
//       },
//       (err) => console.warn('❌ Woman GPS error:', err.message),
//       { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//     );

//     return () => {
//       if (watchIdRef.current !== null) {
//         navigator.geolocation.clearWatch(watchIdRef.current);
//         watchIdRef.current = null;
//       }
//     };

//   }, []);

//   // =====================================================
//   // JOIN ALERT ROOM
//   // =====================================================

//   useEffect(() => {

//     if (!id || roomJoinedRef.current) return;

//     emit('woman:join-alert', { alertId: id });
//     roomJoinedRef.current = true;

//     return () => {
//       emit('woman:leave-alert', { alertId: id });
//       roomJoinedRef.current = false;
//     };

//   }, [id, emit]);

//   // =====================================================
//   // LISTEN: ALERT ACCEPTED (real-time, if page is already open)
//   // =====================================================

//   useEffect(() => {

//     const handleAccepted = (data) => {
//       console.log('✅ alert:accepted on WomanAlertActive:', data);
//       if (data.volunteer) setVolunteer(data.volunteer);
//       if (data.responseMessage) setVolunteerMessage(data.responseMessage);
//       dispatch({ type: 'ALERT_ACCEPTED', payload: data });
//       toast.success(`${data.volunteer?.name || 'Volunteer'} accepted your SOS!`);
//     };

//     on('alert:accepted', handleAccepted);
//     return () => off('alert:accepted', handleAccepted);

//   }, [on, off, dispatch]);

//   // =====================================================
//   // LISTEN: LIVE VOLUNTEER LOCATION
//   // =====================================================

//   useEffect(() => {

//     const handleLocationUpdate = (data) => {
//       dispatch({ type: 'VOLUNTEER_LOCATION_UPDATE', payload: data.coordinates });
//     };

//     on('volunteer-location-update', handleLocationUpdate);
//     return () => off('volunteer-location-update', handleLocationUpdate);

//   }, [on, off, dispatch]);

//   // volunteerLocation is [lng, lat] — convert to [lat, lng] for Leaflet
//   const volunteerCoords = volunteerLocation
//     ? [volunteerLocation[1], volunteerLocation[0]]
//     : null;

//   // =====================================================
//   // RESOLVE
//   // =====================================================

//   const handleResolve = async () => {
//     try {
//       setResolving(true);
//       await alertService.resolve(id);
//       dispatch({ type: 'ALERT_RESOLVED' });
//       toast.success('Help marked as received');
//       navigate(`/review/${id}`);
//     } catch (err) {
//       toast.error(err.message || 'Failed to resolve alert');
//       setResolving(false);
//     }
//   };

//   // =====================================================
//   // CANCEL
//   // =====================================================

//   const handleCancel = async () => {
//     const confirmCancel = window.confirm('Cancel this SOS alert?');
//     if (!confirmCancel) return;
//     try {
//       setCancelling(true);
//       await alertService.cancel(id);
//       dispatch({ type: 'ALERT_CANCELLED' });
//       toast.success('Alert cancelled');
//       navigate('/home');
//     } catch (err) {
//       toast.error(err.message || 'Failed to cancel alert');
//       setCancelling(false);
//     }
//   };

//   const currentStep = STATUS_STEPS.findIndex(step => step.key === status);

//   // =====================================================
//   // UI
//   // =====================================================

//   return (
//     <div className="min-h-screen bg-gray-50">

//       {/* HEADER */}

//       <div className="bg-gradient-to-br from-primary to-red-500 text-white px-5 pt-12 pb-6 shadow-lg">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">Active SOS Alert</p>
//             <h1 className="text-2xl font-bold mt-1">Emergency Assistance</h1>
//           </div>
//           <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
//             <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
//             <span className="text-xs font-bold">LIVE</span>
//           </div>
//         </div>

//         <div className="mt-6 flex items-center">
//           {STATUS_STEPS.map((step, index) => (
//             <div key={step.key} className="flex items-center flex-1">
//               <div className="flex flex-col items-center">
//                 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all ${index <= currentStep ? 'bg-white text-primary' : 'bg-white/20 text-white/70'}`}>
//                   {index < currentStep ? '✓' : step.icon}
//                 </div>
//                 <span className="text-[11px] mt-2 text-center text-white/90 font-medium">{step.label}</span>
//               </div>
//               {index < STATUS_STEPS.length - 1 && (
//                 <div className={`flex-1 h-1 mx-2 rounded-full mb-6 ${index < currentStep ? 'bg-white' : 'bg-white/20'}`} />
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* BODY */}

//       <div className="px-5 py-5 space-y-5 pb-10">

//         {/* STATUS */}

//         <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
//           <p className="text-xs uppercase tracking-wide text-gray-400 font-bold">Current Status</p>
//           <h2 className="text-lg font-bold text-gray-900 mt-2">
//             {volunteer
//               ? 'A volunteer accepted your SOS alert'
//               : STATUS_STEPS[Math.max(currentStep, 0)]?.desc
//             }
//           </h2>
//         </div>

//         {/* VOLUNTEER CARD — shows as soon as volunteer data exists */}

//         {volunteer && (
//           <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-5 shadow-sm">

//             <div className="flex items-start justify-between">
//               <div className="flex items-center gap-4">
//                 <div className="w-14 h-14 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center text-3xl">🙋</div>
//                 <div>
//                   <h3 className="text-lg font-bold text-gray-900">{volunteer.name}</h3>
//                   <p className="text-sm text-green-700 font-medium mt-1">Volunteer is on the way</p>
//                 </div>
//               </div>
//               {volunteer.phone && (
//                 <a href={`tel:${volunteer.phone}`} className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md">
//                   📞
//                 </a>
//               )}
//             </div>

//             <div className="mt-5 grid grid-cols-2 gap-3">
//               <div className="bg-white rounded-2xl p-3">
//                 <p className="text-xs text-gray-400">Rating</p>
//                 <p className="font-bold text-gray-900 mt-1">⭐ {volunteer.averageRating || 0}</p>
//               </div>
//               <div className="bg-white rounded-2xl p-3">
//                 <p className="text-xs text-gray-400">Alerts Helped</p>
//                 <p className="font-bold text-gray-900 mt-1">{volunteer.totalAlertsHelped || 0}</p>
//               </div>
//             </div>

//             {volunteer.volunteerBio && (
//               <div className="mt-4 bg-white rounded-2xl p-4">
//                 <p className="text-xs font-bold text-gray-400 uppercase">About Volunteer</p>
//                 <p className="text-sm text-gray-700 mt-2 leading-relaxed">{volunteer.volunteerBio}</p>
//               </div>
//             )}

//             {volunteer.skills?.length > 0 && (
//               <div className="mt-4">
//                 <p className="text-xs font-bold text-gray-400 uppercase mb-2">Skills</p>
//                 <div className="flex flex-wrap gap-2">
//                   {volunteer.skills.map((skill, idx) => (
//                     <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">{skill}</span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {volunteer.languages?.length > 0 && (
//               <div className="mt-4">
//                 <p className="text-xs font-bold text-gray-400 uppercase mb-2">Languages</p>
//                 <div className="flex flex-wrap gap-2">
//                   {volunteer.languages.map((lang, idx) => (
//                     <span key={idx} className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">{lang}</span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {volunteerMessage && (
//               <div className="mt-4 bg-white/70 rounded-2xl p-4 border border-green-100">
//                 <p className="text-xs uppercase tracking-wide text-green-700 font-bold">Volunteer Message</p>
//                 <p className="text-sm text-gray-700 mt-2 leading-relaxed">"{volunteerMessage}"</p>
//               </div>
//             )}
//           </div>
//         )}

//         {/* LIVE MAP */}

//         <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
//           <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
//             <h3 className="text-sm font-bold text-gray-800">📍 Live Tracking</h3>
//             <span className="text-xs text-gray-400">Real-time location</span>
//           </div>
//           <LiveMap
//             womanPosition={womanCoords}
//             volunteerPosition={volunteerCoords}
//             volunteerPath={[]}
//             className="h-64"
//           />
//         </div>

//         {/* ACTIONS */}

//         <div className="grid grid-cols-2 gap-3">
//           {!volunteer && (
//             <button
//               onClick={handleCancel}
//               disabled={cancelling}
//               className="col-span-2 py-4 rounded-2xl border border-gray-200 text-gray-700 font-semibold disabled:opacity-50"
//             >
//               {cancelling ? 'Cancelling...' : 'Cancel SOS'}
//             </button>
//           )}
//           {volunteer && (
//             <button
//               onClick={handleResolve}
//               disabled={resolving}
//               className="col-span-2 py-4 rounded-2xl bg-green-500 text-white font-bold disabled:opacity-50"
//             >
//               {resolving ? 'Resolving...' : '✅ Mark Help Received'}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }





import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useAlert } from '../../context/AlertContext';
import { useSocket } from '../../context/SocketContext';
import { alertService } from '../../services/api';
import LiveMap from '../../components/LiveMap';
import ChatBox from '../../components/chat/ChatBox';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  { key: 'searching', label: 'Searching', icon: '📡', desc: 'Searching for nearby volunteers...' },
  { key: 'active', label: 'Volunteer Found', icon: '🏃', desc: 'A volunteer accepted your SOS alert' },
  { key: 'resolved', label: 'Safe', icon: '✅', desc: 'Help has arrived' },
];

export default function WomanAlertActive() {

  const { id } = useParams();
  const navigate = useNavigate();

  const { status, volunteerLocation, volunteerProfile, volunteerResponseMessage, dispatch } = useAlert();
  const { emit, on, off } = useSocket();

  const [resolving, setResolving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [volunteer, setVolunteer] = useState(null);
  const [volunteerMessage, setVolunteerMessage] = useState('');

  // =====================================================
  // WOMAN LOCATION — watchPosition with maximumAge:0
  // Same logic as volunteer for accurate real GPS
  // =====================================================
  const [womanCoords, setWomanCoords] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {

    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        console.log('✅ Woman GPS:', {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setWomanCoords([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.warn('❌ Woman geolocation error:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

  }, []);

  // =====================================================
  // SYNC FROM CONTEXT (if alert was accepted before mount)
  // =====================================================

  useEffect(() => {
    if (volunteerProfile && !volunteer) setVolunteer(volunteerProfile);
    if (volunteerResponseMessage && !volunteerMessage) setVolunteerMessage(volunteerResponseMessage);
  }, [volunteerProfile, volunteerResponseMessage]);

  // =====================================================
  // JOIN ALERT ROOM
  // =====================================================

  const roomJoinedRef = useRef(false);

  useEffect(() => {

    if (!id || roomJoinedRef.current) return;

    emit('woman:join-alert', { alertId: id });
    roomJoinedRef.current = true;

    return () => {
      emit('woman:leave-alert', { alertId: id });
      roomJoinedRef.current = false;
    };

  }, [id, emit]);

  // =====================================================
  // LISTEN: ALERT ACCEPTED
  // =====================================================

  useEffect(() => {

    const handleAccepted = (data) => {
      console.log('✅ alert:accepted on WomanAlertActive:', data);
      if (data.volunteer) setVolunteer(data.volunteer);
      if (data.responseMessage) setVolunteerMessage(data.responseMessage);
      dispatch({ type: 'ALERT_ACCEPTED', payload: data });
      toast.success(`${data.volunteer?.name || 'Volunteer'} accepted your SOS!`);
    };

    on('alert:accepted', handleAccepted);
    return () => off('alert:accepted', handleAccepted);

  }, [on, off, dispatch]);

  // =====================================================
  // LISTEN: LIVE VOLUNTEER LOCATION
  // =====================================================

  useEffect(() => {

    const handleLocationUpdate = (data) => {
      dispatch({ type: 'VOLUNTEER_LOCATION_UPDATE', payload: data.coordinates });
    };

    on('volunteer-location-update', handleLocationUpdate);
    return () => off('volunteer-location-update', handleLocationUpdate);

  }, [on, off, dispatch]);

  // volunteerLocation is [lng, lat] — convert to [lat, lng] for Leaflet
  const volunteerCoords = volunteerLocation
    ? [volunteerLocation[1], volunteerLocation[0]]
    : null;

  // =====================================================
  // RESOLVE
  // =====================================================

  const handleResolve = async () => {
    try {
      setResolving(true);
      await alertService.resolve(id);
      dispatch({ type: 'ALERT_RESOLVED' });
      toast.success('Help marked as received');
      navigate(`/review/${id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to resolve alert');
      setResolving(false);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = async () => {
    if (!window.confirm('Cancel this alert?')) return;
    try {
      setCancelling(true);
      await alertService.cancel(id);
      dispatch({ type: 'ALERT_CANCELLED' });
      toast.success('Alert cancelled');
      navigate('/woman/home');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel alert');
      setCancelling(false);
    }
  };

  // =====================================================
  // CURRENT STEP
  // =====================================================

  const currentStep = STATUS_STEPS.find(step => step.key === status) || STATUS_STEPS[0];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 pb-8">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-red-500 to-primary text-white px-5 pt-12 pb-8 rounded-b-[32px] shadow-lg">
        <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">{currentStep.icon} {currentStep.label}</p>
        <h1 className="text-3xl font-bold mt-2">{currentStep.desc}</h1>

        {/* PROGRESS INDICATOR */}
        <div className="mt-6 flex gap-3">
          {STATUS_STEPS.map((step, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                STATUS_STEPS.indexOf(currentStep) >= idx
                  ? 'bg-white'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-5 mt-6 space-y-6">

        {/* VOLUNTEER CARD */}
        {volunteer && status === 'active' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-bold mb-4">Volunteer Details</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">🙋</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{volunteer.name}</h3>
                {volunteer.phone && (
                  <a href={`tel:${volunteer.phone}`} className="text-sm text-primary font-medium mt-1 block">
                    📞 {volunteer.phone}
                  </a>
                )}
              </div>
            </div>

            {volunteerMessage && (
              <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                <p className="text-sm text-blue-800">💬 "{volunteerMessage}"</p>
              </div>
            )}

            {/* VOLUNTEER STATS */}
            <div className="grid grid-cols-3 gap-3 text-center bg-gray-50 rounded-2xl p-4">
              <div>
                <p className="text-2xl font-bold text-primary">{volunteer.totalAlertsHelped || 0}</p>
                <p className="text-xs text-gray-600 mt-1">Alerts Helped</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">⭐ {(volunteer.averageRating || 0).toFixed(1)}</p>
                <p className="text-xs text-gray-600 mt-1">Rating</p>
              </div>
              <div>
                <p className="text-xl">{volunteer.skills?.length || 0} Skills</p>
                <p className="text-xs text-gray-600 mt-1">Available</p>
              </div>
            </div>
          </div>
        )}

        {/* LIVE MAP */}
        {(womanCoords || volunteerCoords) && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">📍 Live Tracking</h3>
              <span className="text-xs text-gray-400">Real-time</span>
            </div>
            <LiveMap
              womanPosition={womanCoords}
              volunteerPosition={volunteerCoords}
              volunteerPath={[]}
              className="h-80"
            />
          </div>
        )}

        {/* CHAT BOX */}
        {status === 'active' && (
          <ChatBox
            alertId={id}
            isAlertActive={status === 'active'}
            volunteerName={volunteer?.name || 'Volunteer'}
          />
        )}

        {/* ACTION BUTTONS */}
        <div className="space-y-3">
          {status === 'active' && (
            <>
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
              >
                {resolving ? '⏳ Marking safe...' : '✅ Help Received - Mark Safe'}
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 rounded-2xl transition-all disabled:opacity-50"
              >
                {cancelling ? '⏳...' : '✗ Cancel Alert'}
              </button>
            </>
          )}
          {status === 'resolved' && (
            <button
              onClick={() => navigate(`/review/${id}`)}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl"
            >
              ⭐ Leave Review
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
