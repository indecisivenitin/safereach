// import { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';

// import { useAlert } from '../../context/AlertContext';
// import { useSocket } from '../../context/SocketContext';

// import { alertService } from '../../services/api';

// import LiveMap from '../../components/LiveMap';

// import toast from 'react-hot-toast';

// const STATUS_STEPS = [
//   {
//     key: 'searching',
//     label: 'Searching',
//     icon: '📡',
//     desc: 'Searching for nearby volunteers...',
//   },
//   {
//     key: 'active',
//     label: 'Volunteer Found',
//     icon: '🏃',
//     desc: 'A volunteer accepted your SOS alert',
//   },
//   {
//     key: 'resolved',
//     label: 'Safe',
//     icon: '✅',
//     desc: 'Help has arrived',
//   },
// ];

// export default function WomanAlertActive() {

//   const { id } = useParams();

//   const navigate = useNavigate();

//   const {
//     status,
//     activeAlert,
//     volunteerLocation,
//     dispatch
//   } = useAlert();

//   const {
//     emit,
//     on,
//     off
//   } = useSocket();

//   // =====================================================
//   // ✅ FIX: Track room join state to prevent race condition
//   // =====================================================
//   const [alertRoomJoined, setAlertRoomJoined] = useState(false);

//   const [resolving, setResolving] =
//     useState(false);

//   const [cancelling, setCancelling] =
//     useState(false);

//   const [volunteer, setVolunteer] =
//     useState(null);

//   const [volunteerMessage, setVolunteerMessage] =
//     useState('');

//   const [womanCoords, setWomanCoords] =
//     useState(null);

//   // =====================================================
//   // ✅ FIX: JOIN ALERT ROOM - WITH CALLBACK
//   // =====================================================
//   // This effect MUST complete before setting up listeners

//   useEffect(() => {

//     if (!id) return;

//     console.log(`📍 Woman joining alert room: ${id}`);

//     // ✅ FIX: Use callback to confirm room join completed
//     emit(
//       'woman:join-alert',
//       { alertId: id },
//       (response) => {
//         console.log('✅ Woman successfully joined alert room:', id);
//         setAlertRoomJoined(true);  // ← Signal that room join is complete
//       }
//     );

//     return () => {

//       console.log(`📍 Woman leaving alert room: ${id}`);

//       emit(
//         'woman:leave-alert',
//         { alertId: id }
//       );

//       setAlertRoomJoined(false);
//     };

//   }, [id, emit]);

//   // =====================================================
//   // ✅ FIX: ALERT ACCEPTED - ONLY LISTEN AFTER ROOM JOIN
//   // =====================================================

//   useEffect(() => {

//     // ✅ FIX: Wait for room join to complete!
//     if (!alertRoomJoined) {
//       console.log('⏳ Waiting for alert room join to complete...');
//       return;
//     }

//     console.log('✅ Setting up alert:accepted listener (room ready)');

//     const handleAccepted = (data) => {

//       console.log(
//         '✅ ALERT ACCEPTED (Woman Side):',
//         data
//       );

//       // Store volunteer data
//       setVolunteer(data.volunteer);

//       if (data.responseMessage) {

//         setVolunteerMessage(
//           data.responseMessage
//         );
//       }

//       // Update context with volunteer details
//       if (data.volunteer) {
//         dispatch({
//           type: 'ALERT_ACCEPTED',
//           payload: data
//         });
//       }

//       // Show success toast
//       toast.success(
//         `${data.volunteer?.name || 'Volunteer'} accepted your SOS!`
//       );

//       console.log('✅ Woman UI updated with volunteer:', data.volunteer);
//     };

//     // ✅ Set up listener only when room join is confirmed
//     on(
//       'alert:accepted',
//       handleAccepted
//     );

//     return () => {

//       off(
//         'alert:accepted',
//         handleAccepted
//       );
//     };

//   }, [alertRoomJoined, on, off, dispatch]);

//   // =====================================================
//   // LIVE VOLUNTEER LOCATION UPDATES
//   // =====================================================

//   useEffect(() => {

//     // ✅ Also wait for room join before listening for location updates
//     if (!alertRoomJoined) return;

//     const handleLocationUpdate = (data) => {

//       console.log(
//         '📍 VOLUNTEER LOCATION UPDATE:',
//         data
//       );

//       // Update context with live location
//       dispatch({
//         type: 'VOLUNTEER_LOCATION_UPDATE',
//         payload: data.coordinates
//       });

//       console.log('📍 Map updating with new location');
//     };

//     // Listen for live location updates
//     on(
//       'volunteer-location-update',
//       handleLocationUpdate
//     );

//     return () => {

//       off(
//         'volunteer-location-update',
//         handleLocationUpdate
//       );
//     };

//   }, [alertRoomJoined, on, off, dispatch]);

//   // =====================================================
//   // GET WOMAN LOCATION
//   // =====================================================

//   useEffect(() => {

//     navigator.geolocation?.getCurrentPosition(
//       (pos) => {

//         setWomanCoords([
//           pos.coords.latitude,
//           pos.coords.longitude
//         ]);
//       },
//       () => { }
//     );

//   }, []);

//   // =====================================================
//   // MAP COORDS
//   // =====================================================

//   const volunteerCoords =
//     volunteerLocation
//       ? [
//         volunteerLocation[1],
//         volunteerLocation[0]
//       ]
//       : null;

//   // =====================================================
//   // RESOLVE ALERT
//   // =====================================================

//   const handleResolve = async () => {

//     try {

//       setResolving(true);

//       await alertService.resolve(id);

//       dispatch({
//         type: 'ALERT_RESOLVED'
//       });

//       toast.success(
//         'Help marked as received'
//       );

//       navigate(`/review/${id}`);

//     } catch (err) {

//       toast.error(
//         err.message ||
//         'Failed to resolve alert'
//       );

//       setResolving(false);
//     }
//   };

//   // =====================================================
//   // CANCEL ALERT
//   // =====================================================

//   const handleCancel = async () => {

//     const confirmCancel = window.confirm(
//       'Cancel this SOS alert?'
//     );

//     if (!confirmCancel) return;

//     try {

//       setCancelling(true);

//       await alertService.cancel(id);

//       dispatch({
//         type: 'ALERT_CANCELLED'
//       });

//       toast.success(
//         'Alert cancelled'
//       );

//       navigate('/woman/home');

//     } catch (err) {

//       toast.error(
//         err.message ||
//         'Failed to cancel alert'
//       );

//       setCancelling(false);
//     }
//   };

//   // =====================================================
//   // STEP
//   // =====================================================

//   const currentStep =
//     STATUS_STEPS.findIndex(
//       (step) =>
//         step.key === status
//     );

//   // =====================================================
//   // UI
//   // =====================================================

//   return (

//     <div className="min-h-screen bg-gray-50">

//       {/* HEADER */}

//       <div className="bg-gradient-to-br from-primary to-red-500 text-white px-5 pt-12 pb-6 shadow-lg">

//         <div className="flex items-center justify-between">

//           <div>

//             <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">
//               Active SOS Alert
//             </p>

//             <h1 className="text-2xl font-bold mt-1">
//               Emergency Assistance
//             </h1>
//           </div>

//           <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">

//             <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />

//             <span className="text-xs font-bold">
//               LIVE
//             </span>

//           </div>
//         </div>

//         {/* PROGRESS */}

//         <div className="mt-6 flex items-center">

//           {STATUS_STEPS.map(
//             (step, index) => (

//               <div
//                 key={step.key}
//                 className="flex items-center flex-1"
//               >

//                 <div className="flex flex-col items-center">

//                   <div
//                     className={`
//                       w-10 h-10 rounded-full
//                       flex items-center justify-center
//                       text-lg font-bold transition-all
//                       ${index <= currentStep
//                         ? 'bg-white text-primary'
//                         : 'bg-white/20 text-white/70'
//                       }
//                     `}
//                   >

//                     {
//                       index < currentStep
//                         ? '✓'
//                         : step.icon
//                     }

//                   </div>

//                   <span className="text-[11px] mt-2 text-center text-white/90 font-medium">
//                     {step.label}
//                   </span>

//                 </div>

//                 {index <
//                   STATUS_STEPS.length - 1 && (

//                     <div
//                       className={`
//                       flex-1 h-1 mx-2 rounded-full mb-6
//                       ${index < currentStep
//                           ? 'bg-white'
//                           : 'bg-white/20'
//                         }
//                     `}
//                     />
//                   )}
//               </div>
//             )
//           )}
//         </div>
//       </div>

//       {/* BODY */}

//       <div className="px-5 py-5 space-y-5 pb-10">

//         {/* LOADING STATE - Show while room is joining */}

//         {
//           !alertRoomJoined && (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-4">
//               <p className="text-sm text-yellow-800">
//                 ⏳ Connecting to alert channel...
//               </p>
//             </div>
//           )
//         }

//         {/* STATUS */}

//         <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">

//           <p className="text-xs uppercase tracking-wide text-gray-400 font-bold">
//             Current Status
//           </p>

//           <h2 className="text-lg font-bold text-gray-900 mt-2">

//             {
//               STATUS_STEPS[
//                 Math.max(
//                   currentStep,
//                   0
//                 )
//               ]?.desc
//             }

//           </h2>

//         </div>

//         {/* VOLUNTEER CARD */}

//         {
//           volunteer &&
//           status === 'active' && (

//             <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-5 shadow-sm">

//               <div className="flex items-start justify-between">

//                 <div className="flex items-center gap-4">

//                   <div className="w-14 h-14 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center text-3xl">
//                     🙋
//                   </div>

//                   <div>

//                     <h3 className="text-lg font-bold text-gray-900">
//                       {volunteer.name}
//                     </h3>

//                     <p className="text-sm text-green-700 font-medium mt-1">
//                       Volunteer is on the way
//                     </p>

//                   </div>
//                 </div>

//                 {
//                   volunteer.phone && (

//                     <a
//                       href={`tel:${volunteer.phone}`}
//                       className="
//                         w-12 h-12 rounded-full
//                         bg-green-500 text-white
//                         flex items-center justify-center
//                         shadow-md
//                       "
//                     >
//                       📞
//                     </a>
//                   )
//                 }
//               </div>

//               {/* FULL PROFILE */}

//               <div className="mt-5 grid grid-cols-2 gap-3">

//                 <div className="bg-white rounded-2xl p-3">
//                   <p className="text-xs text-gray-400">
//                     Rating
//                   </p>

//                   <p className="font-bold text-gray-900 mt-1">
//                     ⭐ {volunteer.averageRating || 0}
//                   </p>
//                 </div>

//                 <div className="bg-white rounded-2xl p-3">
//                   <p className="text-xs text-gray-400">
//                     Alerts Helped
//                   </p>

//                   <p className="font-bold text-gray-900 mt-1">
//                     {volunteer.totalAlertsHelped || 0}
//                   </p>
//                 </div>

//               </div>

//               {/* BIO */}

//               {
//                 volunteer.volunteerBio && (

//                   <div className="mt-4 bg-white rounded-2xl p-4">

//                     <p className="text-xs font-bold text-gray-400 uppercase">
//                       About Volunteer
//                     </p>

//                     <p className="text-sm text-gray-700 mt-2 leading-relaxed">
//                       {volunteer.volunteerBio}
//                     </p>
//                   </div>
//                 )
//               }

//               {/* SKILLS */}

//               {
//                 volunteer.skills?.length > 0 && (

//                   <div className="mt-4">

//                     <p className="text-xs font-bold text-gray-400 uppercase mb-2">
//                       Skills
//                     </p>

//                     <div className="flex flex-wrap gap-2">

//                       {volunteer.skills.map(
//                         (skill, idx) => (

//                           <span
//                             key={idx}
//                             className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium"
//                           >
//                             {skill}
//                           </span>
//                         )
//                       )}
//                     </div>
//                   </div>
//                 )
//               }

//               {/* LANGUAGES */}

//               {
//                 volunteer.languages?.length > 0 && (

//                   <div className="mt-4">

//                     <p className="text-xs font-bold text-gray-400 uppercase mb-2">
//                       Languages
//                     </p>

//                     <div className="flex flex-wrap gap-2">

//                       {volunteer.languages.map(
//                         (lang, idx) => (

//                           <span
//                             key={idx}
//                             className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium"
//                           >
//                             {lang}
//                           </span>
//                         )
//                       )}
//                     </div>
//                   </div>
//                 )
//               }

//               {/* RESPONSE */}

//               {
//                 volunteerMessage && (

//                   <div className="mt-4 bg-white/70 rounded-2xl p-4 border border-green-100">

//                     <p className="text-xs uppercase tracking-wide text-green-700 font-bold">
//                       Volunteer Message
//                     </p>

//                     <p className="text-sm text-gray-700 mt-2 leading-relaxed">
//                       "{volunteerMessage}"
//                     </p>

//                   </div>
//                 )
//               }
//             </div>
//           )
//         }

//         {/* LIVE MAP */}

//         <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">

//           <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">

//             <h3 className="text-sm font-bold text-gray-800">
//               📍 Live Tracking
//             </h3>

//             <span className="text-xs text-gray-400">
//               Real-time location
//             </span>

//           </div>

//           <LiveMap
//             womanPosition={womanCoords}
//             volunteerPosition={volunteerCoords}
//             volunteerPath={[]}
//             className="h-64"
//           />

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

  // Local volunteer state — populated from socket event directly (most reliable)
  const [volunteer, setVolunteer] = useState(null);
  const [volunteerMessage, setVolunteerMessage] = useState('');
  const [womanCoords, setWomanCoords] = useState(null);

  const roomJoinedRef = useRef(false);

  // =====================================================
  // SYNC FROM CONTEXT (if alert was accepted before mount)
  // =====================================================

  useEffect(() => {
    if (volunteerProfile && !volunteer) {
      setVolunteer(volunteerProfile);
    }
    if (volunteerResponseMessage && !volunteerMessage) {
      setVolunteerMessage(volunteerResponseMessage);
    }
  }, [volunteerProfile, volunteerResponseMessage]);

  // =====================================================
  // GET WOMAN LOCATION — use watchPosition for accuracy
  // =====================================================

  useEffect(() => {

    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setWomanCoords([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Fallback: try getCurrentPosition once
        navigator.geolocation.getCurrentPosition(
          (pos) => setWomanCoords([pos.coords.latitude, pos.coords.longitude]),
          () => {}
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);

  }, []);

  // =====================================================
  // JOIN ALERT ROOM
  // =====================================================

  useEffect(() => {

    if (!id || roomJoinedRef.current) return;

    console.log(`📍 Woman joining alert room: ${id}`);

    emit('woman:join-alert', { alertId: id });
    roomJoinedRef.current = true;

    return () => {
      emit('woman:leave-alert', { alertId: id });
      roomJoinedRef.current = false;
    };

  }, [id, emit]);

  // =====================================================
  // LISTEN: ALERT ACCEPTED — get volunteer details
  // =====================================================

  useEffect(() => {

    const handleAccepted = (data) => {

      console.log('✅ alert:accepted received on WomanAlertActive:', data);

      // data.volunteer is the full profile object
      if (data.volunteer) {
        setVolunteer(data.volunteer);
      }

      if (data.responseMessage) {
        setVolunteerMessage(data.responseMessage);
      }

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
      console.log('📍 volunteer-location-update:', data);
      dispatch({ type: 'VOLUNTEER_LOCATION_UPDATE', payload: data.coordinates });
    };

    on('volunteer-location-update', handleLocationUpdate);

    return () => off('volunteer-location-update', handleLocationUpdate);

  }, [on, off, dispatch]);

  // =====================================================
  // MAP COORDS
  // volunteerLocation is [lng, lat] from backend — convert to [lat, lng] for Leaflet
  // =====================================================

  const volunteerCoords = volunteerLocation
    ? [volunteerLocation[1], volunteerLocation[0]]
    : null;

  // =====================================================
  // RESOLVE ALERT
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
  // CANCEL ALERT
  // =====================================================

  const handleCancel = async () => {

    const confirmCancel = window.confirm('Cancel this SOS alert?');
    if (!confirmCancel) return;

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
  // STEP
  // =====================================================

  const currentStep = STATUS_STEPS.findIndex(step => step.key === status);

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <div className="bg-gradient-to-br from-primary to-red-500 text-white px-5 pt-12 pb-6 shadow-lg">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">Active SOS Alert</p>
            <h1 className="text-2xl font-bold mt-1">Emergency Assistance</h1>
          </div>

          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            <span className="text-xs font-bold">LIVE</span>
          </div>
        </div>

        {/* PROGRESS */}

        <div className="mt-6 flex items-center">

          {STATUS_STEPS.map((step, index) => (

            <div key={step.key} className="flex items-center flex-1">

              <div className="flex flex-col items-center">

                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all ${index <= currentStep ? 'bg-white text-primary' : 'bg-white/20 text-white/70'}`}
                >
                  {index < currentStep ? '✓' : step.icon}
                </div>

                <span className="text-[11px] mt-2 text-center text-white/90 font-medium">
                  {step.label}
                </span>
              </div>

              {index < STATUS_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full mb-6 ${index < currentStep ? 'bg-white' : 'bg-white/20'}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* BODY */}

      <div className="px-5 py-5 space-y-5 pb-10">

        {/* STATUS */}

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-400 font-bold">Current Status</p>
          <h2 className="text-lg font-bold text-gray-900 mt-2">
            {STATUS_STEPS[Math.max(currentStep, 0)]?.desc}
          </h2>
        </div>

        {/* VOLUNTEER CARD — show if we have volunteer data, regardless of status state timing */}

        {volunteer && (

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center text-3xl">
                  🙋
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">{volunteer.name}</h3>
                  <p className="text-sm text-green-700 font-medium mt-1">Volunteer is on the way</p>
                </div>
              </div>

              {volunteer.phone && (
                <a
                  href={`tel:${volunteer.phone}`}
                  className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md"
                >
                  📞
                </a>
              )}
            </div>

            {/* STATS */}

            <div className="mt-5 grid grid-cols-2 gap-3">

              <div className="bg-white rounded-2xl p-3">
                <p className="text-xs text-gray-400">Rating</p>
                <p className="font-bold text-gray-900 mt-1">⭐ {volunteer.averageRating || 0}</p>
              </div>

              <div className="bg-white rounded-2xl p-3">
                <p className="text-xs text-gray-400">Alerts Helped</p>
                <p className="font-bold text-gray-900 mt-1">{volunteer.totalAlertsHelped || 0}</p>
              </div>
            </div>

            {/* BIO */}

            {volunteer.volunteerBio && (
              <div className="mt-4 bg-white rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase">About Volunteer</p>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{volunteer.volunteerBio}</p>
              </div>
            )}

            {/* SKILLS */}

            {volunteer.skills?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {volunteer.skills.map((skill, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* LANGUAGES */}

            {volunteer.languages?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {volunteer.languages.map((lang, idx) => (
                    <span key={idx} className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* RESPONSE MESSAGE */}

            {volunteerMessage && (
              <div className="mt-4 bg-white/70 rounded-2xl p-4 border border-green-100">
                <p className="text-xs uppercase tracking-wide text-green-700 font-bold">Volunteer Message</p>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">"{volunteerMessage}"</p>
              </div>
            )}
          </div>
        )}

        {/* LIVE MAP */}

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">

          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">📍 Live Tracking</h3>
            <span className="text-xs text-gray-400">Real-time location</span>
          </div>

          <LiveMap
            womanPosition={womanCoords}
            volunteerPosition={volunteerCoords}
            volunteerPath={[]}
            className="h-64"
          />
        </div>

        {/* ACTIONS */}

        <div className="grid grid-cols-2 gap-3">

          {status !== 'active' && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="py-4 rounded-2xl border border-gray-200 text-gray-700 font-semibold disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel SOS'}
            </button>
          )}

          {status === 'active' && (
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="col-span-2 py-4 rounded-2xl bg-green-500 text-white font-bold disabled:opacity-50"
            >
              {resolving ? 'Resolving...' : '✅ Mark Help Received'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}