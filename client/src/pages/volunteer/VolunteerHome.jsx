
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { useState, useEffect } from 'react';
// import { useSocket } from '../../context/SocketContext';
// import { useAlert } from '../../context/AlertContext';
// import useLocationBroadcast from '../../hooks/useLocationBroadcast';
// import { VolunteerNav } from '../../components/BottomNav';

// export default function VolunteerHome() {

//   const navigate = useNavigate();

//   const {
//     socket,
//     connected,
//     emit,
//     on,
//     off
//   } = useSocket();

//   const {
//     incomingAlert,
//     dispatch
//   } = useAlert();

//   const [isAvailable, setIsAvailable] = useState(false);

//   const [alerts, setAlerts] = useState([]);

//   const [responseMessages, setResponseMessages] = useState({});

//   const [processingAlert, setProcessingAlert] = useState(null);

//   const [activeAcceptedAlert, setActiveAcceptedAlert] = useState(null);

//   // =====================================================
//   // LOCATION BROADCAST
//   // =====================================================

//   useLocationBroadcast({
//     enabled: isAvailable && !activeAcceptedAlert,  // ✅ FIX: Don't broadcast until accepted
//     alertId: activeAcceptedAlert
//   });

//   // =====================================================
//   // VOLUNTEER ACTIVE STATUS
//   // =====================================================

//   useEffect(() => {

//     if (!connected) return;

//     console.log('📡 Emitting volunteer:toggle-status with isActive:true');

//     emit(
//       'volunteer:toggle-status',
//       { isActive: true },
//       (response) => {
//         console.log('✅ Status updated:', response);
//         setIsAvailable(true);
//       }
//     );

//     return () => {
//       console.log('📡 Emitting volunteer:toggle-status with isActive:false');
//       emit(
//         'volunteer:toggle-status',
//         { isActive: false }
//       );
//     };

//   }, [connected, emit]);

//   // =====================================================
//   // SYNC INCOMING ALERT FROM CONTEXT TO LOCAL STATE
//   // =====================================================

//   useEffect(() => {

//     if (!incomingAlert) return;

//     console.log('🔍 INCOMING ALERT OBJECT:', incomingAlert);

//     // Alert object is nested inside incomingAlert.alert
//     const alertData = incomingAlert.alert || {};

//     const newAlert = {
//       _id: alertData._id,
//       woman: incomingAlert.woman,
//       coordinates: incomingAlert.coordinates,
//       message: incomingAlert.message,
//       createdAt: incomingAlert.createdAt,
//       distance: incomingAlert.distance
//     };

//     console.log('📦 MAPPED ALERT OBJECT:', newAlert);
//     console.log('✅ Alert ID:', newAlert._id);

//     // Defensive check
//     if (!newAlert._id) {
//       console.error('❌ Alert ID is missing or undefined!');
//       console.error('Full incoming alert:', incomingAlert);
//       toast.error('Failed to load alert - invalid data');
//       return;
//     }

//     setAlerts(prev => {

//       const exists = prev.some(
//         item => item._id === newAlert._id
//       );

//       if (exists) return prev;

//       return [
//         newAlert,
//         ...prev
//       ];
//     });

//   }, [incomingAlert]);

//   // =====================================================
//   // LISTEN FOR NEW ALERTS FROM SOCKET
//   // =====================================================

//   useEffect(() => {

//     if (!socket) return;

//     const handleSOSAlert = (data) => {

//       console.log(
//         '🚨 NEW ALERT RECEIVED:',
//         data
//       );

//       navigator.vibrate?.([
//         200,
//         100,
//         200
//       ]);

//       // Dispatch to AlertContext for global state
//       dispatch({
//         type: 'INCOMING_ALERT',
//         payload: data
//       });
//     };

//     // ✅ CORRECT EVENT NAME - matches backend
//     on(
//       'new-sos-alert',
//       handleSOSAlert
//     );

//     return () => {

//       off(
//         'new-sos-alert',
//         handleSOSAlert
//       );
//     };

//   }, [socket, dispatch, on, off]);

//   // =====================================================
//   // LISTEN FOR ALERT ACCEPTED BY YOU (CONFIRMATION)
//   // =====================================================

//   useEffect(() => {

//     if (!socket) return;

//     const handleAlertAcceptedByYou = (data) => {

//       console.log(
//         '✅ ALERT ACCEPTED BY YOU CONFIRMED:',
//         data
//       );

//       // ✅ FIX: Reset button state immediately
//       setProcessingAlert(null);

//       // ✅ FIX: Set active accepted alert
//       setActiveAcceptedAlert(data.alertId);

//       // Clear from local state immediately
//       setAlerts(prev =>
//         prev.filter(
//           alert =>
//             alert._id !== data.alertId
//         )
//       );

//       // Clear from context
//       dispatch({
//         type: 'CLEAR_INCOMING'
//       });

//       // ✅ FIX: Join alert room BEFORE navigating
//       // This ensures volunteer receives location updates
//       emit(
//         'join-alert-room',
//         { alertId: data.alertId }
//       );

//       // Navigate without updating user state
//       // This prevents socket disconnect
//       toast.success('Alert accepted! Navigating...');

//       setTimeout(() => {
//         navigate(
//           `/volunteer/active-alert/${data.alertId}`
//         );
//       }, 300);
//     };

//     on(
//       'alert:accepted-by-you',
//       handleAlertAcceptedByYou
//     );

//     return () => {

//       off(
//         'alert:accepted-by-you',
//         handleAlertAcceptedByYou
//       );
//     };

//   }, [socket, navigate, dispatch, emit, on, off]);

//   // =====================================================
//   // QUICK REPLY
//   // =====================================================

//   const setQuickReply = (
//     alertId,
//     message
//   ) => {

//     setResponseMessages(prev => ({
//       ...prev,
//       [alertId]: message
//     }));
//   };

//   // =====================================================
//   // ACCEPT ALERT
//   // =====================================================

//   const handleAccept = (alertId) => {

//     console.log('🔘 ACCEPT CLICKED - Alert ID:', alertId);
//     console.log('📋 Full alerts state:', alerts);

//     if (!alertId) {

//       console.error('❌ NO ALERT ID PROVIDED');
//       toast.error(
//         'Invalid alert ID'
//       );

//       return;
//     }

//     setProcessingAlert(alertId);

//     emit(
//       'alert:accept',

//       {
//         alertId,

//         responseMessage:
//           responseMessages[alertId] ||
//           'I am on my way. Stay safe.'
//       },

//       (response) => {

//         console.log('✅ ACCEPT RESPONSE:', response);

//         if (response?.success) {

//           // ✅ FIX: Don't navigate here or update user state
//           // Wait for socket event 'alert:accepted-by-you' 
//           // This prevents socket disconnect
          
//           toast.success(
//             'Emergency accepted successfully'
//           );

//           console.log(
//             '⏳ Waiting for socket confirmation...'
//           );

//           // Socket will handle navigation via alert:accepted-by-you event

//         } else {

//           setProcessingAlert(null);

//           toast.error(
//             response?.message ||
//             'Failed to accept alert'
//           );
//         }
//       }
//     );
//   };

//   // =====================================================
//   // REJECT ALERT
//   // =====================================================

//   const handleReject = (alertId) => {

//     setAlerts(prev =>
//       prev.filter(
//         alert =>
//           alert._id !== alertId
//       )
//     );

//     // Clear incoming alert from context
//     dispatch({
//       type: 'CLEAR_INCOMING'
//     });

//     emit(
//       'alert:reject',
//       { alertId }
//     );

//     toast(
//       'Alert rejected',
//       {
//         icon: 'ℹ️'
//       }
//     );
//   };

//   // =====================================================
//   // UI
//   // =====================================================

//   return (

//     <div className="min-h-screen bg-gray-50 pb-24">

//       {/* HEADER */}

//       <div className="bg-gradient-to-r from-primary to-red-500 text-white px-5 pt-12 pb-8 rounded-b-[32px] shadow-lg">

//         <div className="flex items-start justify-between">

//           <div>

//             <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">
//               Volunteer Dashboard
//             </p>

//             <h1 className="text-3xl font-bold mt-2 leading-tight">
//               Ready to Help 🚨
//             </h1>

//             <p className="text-sm text-white/80 mt-2">
//               Respond instantly to nearby SOS alerts
//             </p>
//           </div>

//           <div
//             className={`
//               px-4 py-2 rounded-full text-xs font-bold shadow-md
//               ${connected
//                 ? 'bg-green-500'
//                 : 'bg-red-500'
//               }
//             `}
//           >
//             {
//               connected
//                 ? 'ONLINE'
//                 : 'OFFLINE'
//             }
//           </div>
//         </div>

//         {/* STATUS */}

//         <div className="mt-6 bg-white/10 backdrop-blur rounded-3xl p-4 border border-white/10">

//           <div className="flex items-center justify-between">

//             <div>

//               <p className="text-xs text-white/70">
//                 Volunteer Status
//               </p>

//               <p className="font-semibold mt-1 text-lg">
//                 {
//                   isAvailable
//                     ? 'Available for Emergencies'
//                     : 'Unavailable'
//                 }
//               </p>
//             </div>

//             <div
//               className={`
//                 w-4 h-4 rounded-full
//                 ${isAvailable
//                   ? 'bg-green-400 animate-pulse'
//                   : 'bg-gray-400'
//                 }
//               `}
//             />
//           </div>
//         </div>
//       </div>

//       {/* QUICK ACTIONS */}

//       <div className="px-5 mt-5">

//         <div className="grid grid-cols-2 gap-4">

//           <button
//             onClick={() =>
//               navigate('/volunteer/history')
//             }
//             className="
//               bg-white
//               rounded-3xl
//               p-5
//               shadow-sm
//               border border-gray-100
//               text-left
//               active:scale-[0.98]
//               transition-all
//             "
//           >
//             <div className="text-3xl">
//               📋
//             </div>

//             <h3 className="font-bold text-gray-900 mt-3">
//               Alert History
//             </h3>

//             <p className="text-xs text-gray-500 mt-1">
//               View accepted emergencies
//             </p>
//           </button>

//           <button
//             onClick={() =>
//               navigate('/volunteer/profile')
//             }
//             className="
//               bg-white
//               rounded-3xl
//               p-5
//               shadow-sm
//               border border-gray-100
//               text-left
//               active:scale-[0.98]
//               transition-all
//             "
//           >
//             <div className="text-3xl">
//               👤
//             </div>

//             <h3 className="font-bold text-gray-900 mt-3">
//               My Profile
//             </h3>

//             <p className="text-xs text-gray-500 mt-1">
//               Manage volunteer details
//             </p>
//           </button>
//         </div>
//       </div>

//       {/* ALERTS */}

//       <div className="px-5 mt-6">

//         <div className="flex items-center justify-between mb-4">

//           <h2 className="text-lg font-bold text-gray-900">
//             Live SOS Alerts
//           </h2>

//           <div className="text-sm font-semibold text-primary">
//             {alerts.length}
//           </div>
//         </div>

//         {/* EMPTY */}

//         {alerts.length === 0 && (

//           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">

//             <div className="text-6xl mb-4">
//               🚨
//             </div>

//             <h2 className="text-xl font-bold text-gray-800">
//               Waiting for SOS alerts
//             </h2>

//             <p className="text-gray-500 mt-2 text-sm">
//               Nearby emergency requests will appear here instantly.
//             </p>

//             <div className="mt-6 text-xs text-gray-400">
//               Keep your internet and location enabled.
//             </div>
//           </div>
//         )}

//         {/* ALERT LIST */}

//         <div className="space-y-4">

//           {alerts.map((alert, index) => (

//             <div
//               key={alert._id || index}
//               className="bg-white rounded-3xl p-5 shadow-sm border border-red-100"
//             >

//               <div className="flex items-start justify-between gap-4">

//                 <div>

//                   <p className="text-xs uppercase tracking-wide text-red-500 font-bold">
//                     Emergency SOS
//                   </p>

//                   <h3 className="text-lg font-bold text-gray-900 mt-1">
//                     {
//                       alert.woman?.name ||
//                       'Woman in distress'
//                     }
//                   </h3>

//                   <p className="text-sm text-gray-600 mt-3">
//                     {
//                       alert.message ||
//                       'Emergency assistance required'
//                     }
//                   </p>

//                   <div className="mt-4 text-xs text-gray-500 space-y-1">

//                     <p>
//                       Alert ID:
//                       {' '}
//                       {alert._id}
//                     </p>

//                     <p>
//                       Coordinates:
//                       {' '}
//                       {
//                         alert.coordinates?.join(', ')
//                       }
//                     </p>
//                   </div>
//                 </div>

//                 <div className="animate-pulse text-4xl">
//                   🚨
//                 </div>
//               </div>

//               {/* QUICK REPLIES */}

//               <div className="mt-5 flex flex-wrap gap-2">

//                 {[
//                   'On my way',
//                   'Stay calm',
//                   'Calling police',
//                   'Reached nearby'
//                 ].map(msg => (

//                   <button
//                     key={msg}
//                     onClick={() =>
//                       setQuickReply(
//                         alert._id,
//                         msg
//                       )
//                     }
//                     className={`
//                       px-3 py-1.5 rounded-full text-xs font-medium transition-all
//                       ${responseMessages[alert._id] === msg
//                         ? 'bg-primary text-white'
//                         : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                       }
//                     `}
//                   >
//                     {msg}
//                   </button>
//                 ))}
//               </div>

//               {/* MESSAGE */}

//               <textarea
//                 rows={2}
//                 placeholder="Send reassurance message..."
//                 value={
//                   responseMessages[alert._id] || ''
//                 }
//                 onChange={(e) =>
//                   setResponseMessages(prev => ({
//                     ...prev,
//                     [alert._id]: e.target.value
//                   }))
//                 }
//                 className="
//                   mt-4
//                   w-full
//                   rounded-2xl
//                   border border-gray-200
//                   px-4 py-3
//                   text-sm
//                   outline-none
//                   focus:ring-2
//                   focus:ring-primary/30
//                 "
//               />

//               {/* ACTIONS */}

//               <div className="mt-5 grid grid-cols-2 gap-3">

//                 <button
//                   onClick={() =>
//                     handleReject(alert._id)
//                   }
//                   className="
//                     py-3
//                     rounded-2xl
//                     border border-gray-200
//                     text-gray-700
//                     font-semibold
//                     hover:bg-gray-50
//                     transition-all
//                   "
//                 >
//                   Reject
//                 </button>

//                 <button
//                   disabled={
//                     processingAlert === alert._id
//                   }
//                   onClick={() =>
//                     handleAccept(alert._id)
//                   }
//                   className="
//                     bg-primary
//                     hover:bg-primary-dark
//                     text-white
//                     font-bold
//                     py-3
//                     rounded-2xl
//                     transition-all
//                     disabled:opacity-50
//                   "
//                 >
//                   {
//                     processingAlert === alert._id
//                       ? 'Accepting...'
//                       : 'Accept Alert'
//                   }
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* BOTTOM NAV */}

//       <VolunteerNav />

//     </div>
//   );
// }





import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAlert } from '../../context/AlertContext';
import useLocationBroadcast from '../../hooks/useLocationBroadcast';
import { VolunteerNav } from '../../components/BottomNav';

export default function VolunteerHome() {

  const navigate = useNavigate();

  const { socket, connected, emit, on, off } = useSocket();

  const { incomingAlert, dispatch } = useAlert();

  const [isAvailable, setIsAvailable] = useState(false);

  const [alerts, setAlerts] = useState([]);

  const [responseMessages, setResponseMessages] = useState({});

  const [processingAlert, setProcessingAlert] = useState(null);

  const [activeAcceptedAlert, setActiveAcceptedAlert] = useState(null);

  // Track if we've already set active status to avoid re-triggering
  const statusSetRef = useRef(false);

  // =====================================================
  // LOCATION BROADCAST (only when tracking an active alert)
  // =====================================================

  useLocationBroadcast({
    enabled: !!activeAcceptedAlert,
    alertId: activeAcceptedAlert
  });

  // =====================================================
  // VOLUNTEER ACTIVE STATUS
  // Set once on connect, don't set inactive on unmount
  // (unmount happens on navigate, we don't want logout)
  // =====================================================

  useEffect(() => {

    if (!connected || statusSetRef.current) return;

    // Get current GPS before going active so DB has real coords
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const coordinates = [
          pos.coords.longitude,
          pos.coords.latitude
        ];

        emit(
          'volunteer:toggle-status',
          { isActive: true, coordinates },
          (response) => {
            console.log('✅ Status updated with location:', response);
            setIsAvailable(true);
            statusSetRef.current = true;
          }
        );
      },
      () => {
        // No GPS, still go active
        emit(
          'volunteer:toggle-status',
          { isActive: true },
          (response) => {
            console.log('✅ Status updated (no GPS):', response);
            setIsAvailable(true);
            statusSetRef.current = true;
          }
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    // NOTE: No cleanup that sets isActive:false here.
    // We only want to go inactive when the volunteer explicitly
    // logs out or closes the app — not on every navigation.

  }, [connected, emit]);

  // =====================================================
  // SYNC INCOMING ALERT FROM CONTEXT TO LOCAL STATE
  // =====================================================

  useEffect(() => {

    if (!incomingAlert) return;

    const alertData = incomingAlert.alert || {};

    const newAlert = {
      _id: alertData._id,
      woman: incomingAlert.woman,
      coordinates: incomingAlert.coordinates,
      message: incomingAlert.message,
      createdAt: incomingAlert.createdAt,
      distance: incomingAlert.distance
    };

    if (!newAlert._id) {
      console.error('❌ Alert ID missing:', incomingAlert);
      return;
    }

    setAlerts(prev => {
      const exists = prev.some(item => item._id === newAlert._id);
      if (exists) return prev;
      return [newAlert, ...prev];
    });

  }, [incomingAlert]);

  // =====================================================
  // LISTEN FOR NEW ALERTS FROM SOCKET
  // =====================================================

  useEffect(() => {

    if (!socket) return;

    const handleSOSAlert = (data) => {
      console.log('🚨 NEW ALERT RECEIVED:', data);
      navigator.vibrate?.([200, 100, 200]);
      dispatch({ type: 'INCOMING_ALERT', payload: data });
    };

    on('new-sos-alert', handleSOSAlert);

    return () => off('new-sos-alert', handleSOSAlert);

  }, [socket, dispatch, on, off]);

  // =====================================================
  // LISTEN FOR ALERT ACCEPTED CONFIRMATION
  // =====================================================

  useEffect(() => {

    if (!socket) return;

    const handleAlertAcceptedByYou = (data) => {

      console.log('✅ ALERT ACCEPTED BY YOU:', data);

      setProcessingAlert(null);
      setActiveAcceptedAlert(data.alertId);

      setAlerts(prev => prev.filter(a => a._id !== data.alertId));

      dispatch({ type: 'CLEAR_INCOMING' });

      emit('join-alert-room', { alertId: data.alertId });

      toast.success('Alert accepted!');

      // Small delay to let room join before navigating
      setTimeout(() => {
        navigate(`/volunteer/active-alert/${data.alertId}`);
      }, 300);
    };

    on('alert:accepted-by-you', handleAlertAcceptedByYou);

    return () => off('alert:accepted-by-you', handleAlertAcceptedByYou);

  }, [socket, navigate, dispatch, emit, on, off]);

  // =====================================================
  // QUICK REPLY
  // =====================================================

  const setQuickReply = (alertId, message) => {
    setResponseMessages(prev => ({ ...prev, [alertId]: message }));
  };

  // =====================================================
  // ACCEPT ALERT
  // =====================================================

  const handleAccept = (alertId) => {

    if (!alertId) {
      toast.error('Invalid alert ID');
      return;
    }

    setProcessingAlert(alertId);

    emit(
      'alert:accept',
      {
        alertId,
        responseMessage: responseMessages[alertId] || 'I am on my way. Stay safe.'
      },
      (response) => {
        console.log('✅ ACCEPT RESPONSE:', response);

        if (response?.success) {
          toast.success('Emergency accepted!');
        } else {
          setProcessingAlert(null);
          toast.error(response?.message || 'Failed to accept alert');
        }
      }
    );
  };

  // =====================================================
  // REJECT ALERT
  // =====================================================

  const handleReject = (alertId) => {

    setAlerts(prev => prev.filter(a => a._id !== alertId));
    dispatch({ type: 'CLEAR_INCOMING' });
    emit('alert:reject', { alertId });
    toast('Alert rejected', { icon: 'ℹ️' });
  };

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="min-h-screen bg-gray-50 pb-24">

      {/* HEADER */}

      <div className="bg-gradient-to-r from-primary to-red-500 text-white px-5 pt-12 pb-8 rounded-b-[32px] shadow-lg">

        <div className="flex items-start justify-between">

          <div>
            <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">
              Volunteer Dashboard
            </p>

            <h1 className="text-3xl font-bold mt-2 leading-tight">
              Ready to Help 🚨
            </h1>

            <p className="text-sm text-white/80 mt-2">
              Respond instantly to nearby SOS alerts
            </p>
          </div>

          <div
            className={`px-4 py-2 rounded-full text-xs font-bold shadow-md ${connected ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {connected ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>

        {/* STATUS */}

        <div className="mt-6 bg-white/10 backdrop-blur rounded-3xl p-4 border border-white/10">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-white/70">Volunteer Status</p>
              <p className="font-semibold mt-1 text-lg">
                {isAvailable ? 'Available for Emergencies' : 'Connecting...'}
              </p>
            </div>

            <div
              className={`w-4 h-4 rounded-full ${isAvailable ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}
            />
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}

      <div className="px-5 mt-5">

        <div className="grid grid-cols-2 gap-4">

          <button
            onClick={() => navigate('/volunteer/history')}
            className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-left active:scale-[0.98] transition-all"
          >
            <div className="text-3xl">📋</div>
            <h3 className="font-bold text-gray-900 mt-3">Alert History</h3>
            <p className="text-xs text-gray-500 mt-1">View accepted emergencies</p>
          </button>

          <button
            onClick={() => navigate('/volunteer/profile')}
            className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-left active:scale-[0.98] transition-all"
          >
            <div className="text-3xl">👤</div>
            <h3 className="font-bold text-gray-900 mt-3">My Profile</h3>
            <p className="text-xs text-gray-500 mt-1">Manage volunteer details</p>
          </button>
        </div>
      </div>

      {/* ALERTS */}

      <div className="px-5 mt-6">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Live SOS Alerts</h2>
          <div className="text-sm font-semibold text-primary">{alerts.length}</div>
        </div>

        {alerts.length === 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="text-6xl mb-4">🚨</div>
            <h2 className="text-xl font-bold text-gray-800">Waiting for SOS alerts</h2>
            <p className="text-gray-500 mt-2 text-sm">Nearby emergency requests will appear here instantly.</p>
            <div className="mt-6 text-xs text-gray-400">Keep your internet and location enabled.</div>
          </div>
        )}

        <div className="space-y-4">

          {alerts.map((alert, index) => (

            <div
              key={alert._id || index}
              className="bg-white rounded-3xl p-5 shadow-sm border border-red-100"
            >

              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="text-xs uppercase tracking-wide text-red-500 font-bold">Emergency SOS</p>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    {alert.woman?.name || 'Woman in distress'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-3">
                    {alert.message || 'Emergency assistance required'}
                  </p>
                  {alert.distance && (
                    <p className="text-xs text-gray-400 mt-2">
                      ~{Math.round(alert.distance / 1000 * 10) / 10} km away
                    </p>
                  )}
                </div>

                <div className="animate-pulse text-4xl">🚨</div>
              </div>

              {/* QUICK REPLIES */}

              <div className="mt-5 flex flex-wrap gap-2">
                {['On my way', 'Stay calm', 'Calling police', 'Reached nearby'].map(msg => (
                  <button
                    key={msg}
                    onClick={() => setQuickReply(alert._id, msg)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${responseMessages[alert._id] === msg ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {msg}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                placeholder="Send reassurance message..."
                value={responseMessages[alert._id] || ''}
                onChange={(e) => setResponseMessages(prev => ({ ...prev, [alert._id]: e.target.value }))}
                className="mt-4 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />

              <div className="mt-5 grid grid-cols-2 gap-3">

                <button
                  onClick={() => handleReject(alert._id)}
                  className="py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Reject
                </button>

                <button
                  disabled={processingAlert === alert._id}
                  onClick={() => handleAccept(alert._id)}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-2xl transition-all disabled:opacity-50"
                >
                  {processingAlert === alert._id ? 'Accepting...' : 'Accept Alert'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <VolunteerNav />
    </div>
  );
}