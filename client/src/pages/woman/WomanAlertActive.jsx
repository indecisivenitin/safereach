

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

//   const [resolving, setResolving] = useState(false);

//   const [cancelling, setCancelling] = useState(false);

//   const [volunteer, setVolunteer] = useState(null);

//   const [volunteerMessage, setVolunteerMessage] = useState('');

//   const [womanCoords, setWomanCoords] = useState(null);

//   // =====================================================
//   // JOIN ALERT ROOM
//   // =====================================================

//   useEffect(() => {

//     if (!id) return;

//     emit(
//       'woman:join-alert',
//       { alertId: id }
//     );

//     return () => {

//       emit(
//         'woman:leave-alert',
//         { alertId: id }
//       );
//     };

//   }, [id]);

//   // =====================================================
//   // LISTEN FOR ACCEPTED ALERT
//   // =====================================================

//   useEffect(() => {

//     const handleAccepted = (data) => {

//       console.log(
//         '✅ ALERT ACCEPTED:',
//         data
//       );

//       setVolunteer(data.volunteer);

//       if (data.responseMessage) {
//         setVolunteerMessage(data.responseMessage);
//       }

//       dispatch({
//         type: 'ALERT_ACCEPTED',
//         payload: data
//       });

//       toast.success(
//         `${data.volunteer.name} accepted your SOS`
//       );
//     };

//     on('alert:accepted', handleAccepted);

//     return () => {
//       off('alert:accepted', handleAccepted);
//     };

//   }, [on, off]);

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
//       () => {}
//     );

//   }, []);

//   // =====================================================
//   // MAP COORDS
//   // =====================================================

//   const volunteerCoords = volunteerLocation
//     ? [
//         volunteerLocation[1],
//         volunteerLocation[0]
//       ]
//     : null;

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

//   const currentStep = STATUS_STEPS.findIndex(
//     (step) => step.key === status
//   );

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

//           {STATUS_STEPS.map((step, index) => (

//             <div
//               key={step.key}
//               className="flex items-center flex-1"
//             >

//               <div className="flex flex-col items-center">

//                 <div
//                   className={`
//                     w-10 h-10 rounded-full
//                     flex items-center justify-center
//                     text-lg font-bold transition-all
//                     ${
//                       index <= currentStep
//                         ? 'bg-white text-primary'
//                         : 'bg-white/20 text-white/70'
//                     }
//                   `}
//                 >
//                   {
//                     index < currentStep
//                       ? '✓'
//                       : step.icon
//                   }
//                 </div>

//                 <span className="text-[11px] mt-2 text-center text-white/90 font-medium">
//                   {step.label}
//                 </span>
//               </div>

//               {index < STATUS_STEPS.length - 1 && (

//                 <div
//                   className={`
//                     flex-1 h-1 mx-2 rounded-full mb-6
//                     ${
//                       index < currentStep
//                         ? 'bg-white'
//                         : 'bg-white/20'
//                     }
//                   `}
//                 />
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* BODY */}

//       <div className="px-5 py-5 space-y-5 pb-10">

//         {/* STATUS */}

//         <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">

//           <p className="text-xs uppercase tracking-wide text-gray-400 font-bold">
//             Current Status
//           </p>

//           <h2 className="text-lg font-bold text-gray-900 mt-2">
//             {
//               STATUS_STEPS[
//                 Math.max(currentStep, 0)
//               ]?.desc
//             }
//           </h2>

//           {
//             status === 'searching' && (
//               <div className="flex items-center gap-2 mt-4">

//                 <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />

//                 <span className="text-sm text-gray-500">
//                   Notifying nearby volunteers...
//                 </span>
//               </div>
//             )
//           }
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

//               {/* RESPONSE MESSAGE */}

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
//             className="h-64"
//           />
//         </div>

//         {/* USER MESSAGE */}

//         {
//           activeAlert?.message && (

//             <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5">

//               <p className="text-xs uppercase tracking-wide text-amber-700 font-bold">
//                 Your Emergency Message
//               </p>

//               <p className="text-sm text-gray-700 mt-2 leading-relaxed">
//                 "{activeAlert.message}"
//               </p>
//             </div>
//           )
//         }

//         {/* ACTION BUTTONS */}

//         <div className="space-y-3 pt-1">

//           {
//             status === 'active' && (

//               <button
//                 onClick={handleResolve}
//                 disabled={resolving}
//                 className="
//                   w-full
//                   bg-green-500 hover:bg-green-600
//                   text-white
//                   font-bold
//                   py-4
//                   rounded-2xl
//                   transition-all
//                   flex items-center justify-center gap-2
//                 "
//               >

//                 {
//                   resolving
//                     ? (
//                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                     )
//                     : '✅ Help Has Arrived'
//                 }
//               </button>
//             )
//           }

//           {
//             (
//               status === 'pending' ||
//               status === 'searching'
//             ) && (

//               <button
//                 onClick={handleCancel}
//                 disabled={cancelling}
//                 className="
//                   w-full
//                   border border-red-200
//                   text-red-500
//                   font-bold
//                   py-4
//                   rounded-2xl
//                   hover:bg-red-50
//                   transition-all
//                 "
//               >
//                 {
//                   cancelling
//                     ? 'Cancelling...'
//                     : '✕ Cancel Alert'
//                 }
//               </button>
//             )
//           }
//         </div>

//         {/* HELPLINE */}

//         <div className="bg-red-50 border border-red-100 rounded-3xl p-4">

//           <p className="text-sm text-red-700 font-medium leading-relaxed">
//             🚨 If you are in immediate danger call
//             {' '}
//             <strong>112</strong>
//             {' '}
//             or Women Helpline
//             {' '}
//             <strong>1091</strong>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }











import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useAlert } from '../../context/AlertContext';
import { useSocket } from '../../context/SocketContext';

import { alertService } from '../../services/api';

import LiveMap from '../../components/LiveMap';

import toast from 'react-hot-toast';

const STATUS_STEPS = [
  {
    key: 'searching',
    label: 'Searching',
    icon: '📡',
    desc: 'Searching for nearby volunteers...',
  },
  {
    key: 'active',
    label: 'Volunteer Found',
    icon: '🏃',
    desc: 'A volunteer accepted your SOS alert',
  },
  {
    key: 'resolved',
    label: 'Safe',
    icon: '✅',
    desc: 'Help has arrived',
  },
];

export default function WomanAlertActive() {

  const { id } = useParams();

  const navigate = useNavigate();

  const {
    status,
    activeAlert,
    volunteerLocation,
    dispatch
  } = useAlert();

  const {
    emit,
    on,
    off
  } = useSocket();

  const [resolving, setResolving] =
    useState(false);

  const [cancelling, setCancelling] =
    useState(false);

  const [volunteer, setVolunteer] =
    useState(null);

  const [volunteerMessage, setVolunteerMessage] =
    useState('');

  const [womanCoords, setWomanCoords] =
    useState(null);

  // =====================================================
  // JOIN ALERT ROOM
  // =====================================================

  useEffect(() => {

    if (!id) return;

    emit(
      'woman:join-alert',
      { alertId: id }
    );

    return () => {

      emit(
        'woman:leave-alert',
        { alertId: id }
      );
    };

  }, [id]);

  // =====================================================
  // ALERT ACCEPTED
  // =====================================================

  useEffect(() => {

    const handleAccepted = (data) => {

      console.log(
        '✅ ALERT ACCEPTED:',
        data
      );

      setVolunteer(data.volunteer);

      if (data.responseMessage) {

        setVolunteerMessage(
          data.responseMessage
        );
      }

      // SAVE LIVE LOCATION

      if (
        data.volunteer?.location?.coordinates
      ) {

        dispatch({
          type: 'VOLUNTEER_LOCATION_UPDATE',
          payload:
            data.volunteer.location.coordinates
        });
      }

      dispatch({
        type: 'ALERT_ACCEPTED',
        payload: data
      });

      toast.success(
        `${data.volunteer.name} accepted your SOS`
      );
    };

    on(
      'alert:accepted',
      handleAccepted
    );

    return () => {

      off(
        'alert:accepted',
        handleAccepted
      );
    };

  }, [on, off]);

  // =====================================================
  // LIVE VOLUNTEER LOCATION
  // =====================================================

  useEffect(() => {

    const handleLocationUpdate = (data) => {

      console.log(
        '📍 VOLUNTEER LOCATION:',
        data
      );

      dispatch({
        type: 'VOLUNTEER_LOCATION_UPDATE',
        payload: data.coordinates
      });
    };

    on(
      'volunteer-location-update',
      handleLocationUpdate
    );

    return () => {

      off(
        'volunteer-location-update',
        handleLocationUpdate
      );
    };

  }, [on, off]);

  // =====================================================
  // GET WOMAN LOCATION
  // =====================================================

  useEffect(() => {

    navigator.geolocation?.getCurrentPosition(
      (pos) => {

        setWomanCoords([
          pos.coords.latitude,
          pos.coords.longitude
        ]);
      },
      () => { }
    );

  }, []);

  // =====================================================
  // MAP COORDS
  // =====================================================

  const volunteerCoords =
    volunteerLocation
      ? [
        volunteerLocation[1],
        volunteerLocation[0]
      ]
      : null;

  // =====================================================
  // RESOLVE ALERT
  // =====================================================

  const handleResolve = async () => {

    try {

      setResolving(true);

      await alertService.resolve(id);

      dispatch({
        type: 'ALERT_RESOLVED'
      });

      toast.success(
        'Help marked as received'
      );

      navigate(`/review/${id}`);

    } catch (err) {

      toast.error(
        err.message ||
        'Failed to resolve alert'
      );

      setResolving(false);
    }
  };

  // =====================================================
  // CANCEL ALERT
  // =====================================================

  const handleCancel = async () => {

    const confirmCancel = window.confirm(
      'Cancel this SOS alert?'
    );

    if (!confirmCancel) return;

    try {

      setCancelling(true);

      await alertService.cancel(id);

      dispatch({
        type: 'ALERT_CANCELLED'
      });

      toast.success(
        'Alert cancelled'
      );

      navigate('/woman/home');

    } catch (err) {

      toast.error(
        err.message ||
        'Failed to cancel alert'
      );

      setCancelling(false);
    }
  };

  // =====================================================
  // STEP
  // =====================================================

  const currentStep =
    STATUS_STEPS.findIndex(
      (step) =>
        step.key === status
    );

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <div className="bg-gradient-to-br from-primary to-red-500 text-white px-5 pt-12 pb-6 shadow-lg">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">
              Active SOS Alert
            </p>

            <h1 className="text-2xl font-bold mt-1">
              Emergency Assistance
            </h1>
          </div>

          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">

            <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />

            <span className="text-xs font-bold">
              LIVE
            </span>

          </div>
        </div>

        {/* PROGRESS */}

        <div className="mt-6 flex items-center">

          {STATUS_STEPS.map(
            (step, index) => (

              <div
                key={step.key}
                className="flex items-center flex-1"
              >

                <div className="flex flex-col items-center">

                  <div
                    className={`
                      w-10 h-10 rounded-full
                      flex items-center justify-center
                      text-lg font-bold transition-all
                      ${index <= currentStep
                        ? 'bg-white text-primary'
                        : 'bg-white/20 text-white/70'
                      }
                    `}
                  >

                    {
                      index < currentStep
                        ? '✓'
                        : step.icon
                    }

                  </div>

                  <span className="text-[11px] mt-2 text-center text-white/90 font-medium">
                    {step.label}
                  </span>

                </div>

                {index <
                  STATUS_STEPS.length - 1 && (

                    <div
                      className={`
                      flex-1 h-1 mx-2 rounded-full mb-6
                      ${index < currentStep
                          ? 'bg-white'
                          : 'bg-white/20'
                        }
                    `}
                    />
                  )}
              </div>
            )
          )}
        </div>
      </div>

      {/* BODY */}

      <div className="px-5 py-5 space-y-5 pb-10">

        {/* STATUS */}

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">

          <p className="text-xs uppercase tracking-wide text-gray-400 font-bold">
            Current Status
          </p>

          <h2 className="text-lg font-bold text-gray-900 mt-2">

            {
              STATUS_STEPS[
                Math.max(
                  currentStep,
                  0
                )
              ]?.desc
            }

          </h2>

        </div>

        {/* VOLUNTEER CARD */}

        {
          volunteer &&
          status === 'active' && (

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center text-3xl">
                    🙋
                  </div>

                  <div>

                    <h3 className="text-lg font-bold text-gray-900">
                      {volunteer.name}
                    </h3>

                    <p className="text-sm text-green-700 font-medium mt-1">
                      Volunteer is on the way
                    </p>

                  </div>
                </div>

                {
                  volunteer.phone && (

                    <a
                      href={`tel:${volunteer.phone}`}
                      className="
                        w-12 h-12 rounded-full
                        bg-green-500 text-white
                        flex items-center justify-center
                        shadow-md
                      "
                    >
                      📞
                    </a>
                  )
                }
              </div>

              {/* FULL PROFILE */}

              <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="bg-white rounded-2xl p-3">
                  <p className="text-xs text-gray-400">
                    Rating
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    ⭐ {volunteer.averageRating || 0}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-3">
                  <p className="text-xs text-gray-400">
                    Alerts Helped
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    {volunteer.totalAlertsHelped || 0}
                  </p>
                </div>

              </div>

              {/* BIO */}

              {
                volunteer.volunteerBio && (

                  <div className="mt-4 bg-white rounded-2xl p-4">

                    <p className="text-xs font-bold text-gray-400 uppercase">
                      About Volunteer
                    </p>

                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                      {volunteer.volunteerBio}
                    </p>
                  </div>
                )
              }

              {/* SKILLS */}

              {
                volunteer.skills?.length > 0 && (

                  <div className="mt-4">

                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                      Skills
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {volunteer.skills.map(
                        (skill, idx) => (

                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )
              }

              {/* LANGUAGES */}

              {
                volunteer.languages?.length > 0 && (

                  <div className="mt-4">

                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                      Languages
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {volunteer.languages.map(
                        (lang, idx) => (

                          <span
                            key={idx}
                            className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium"
                          >
                            {lang}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )
              }

              {/* RESPONSE */}

              {
                volunteerMessage && (

                  <div className="mt-4 bg-white/70 rounded-2xl p-4 border border-green-100">

                    <p className="text-xs uppercase tracking-wide text-green-700 font-bold">
                      Volunteer Message
                    </p>

                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                      "{volunteerMessage}"
                    </p>

                  </div>
                )
              }
            </div>
          )
        }

        {/* LIVE MAP */}

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">

          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">

            <h3 className="text-sm font-bold text-gray-800">
              📍 Live Tracking
            </h3>

            <span className="text-xs text-gray-400">
              Real-time location
            </span>

          </div>

          <LiveMap
            womanPosition={womanCoords}
            volunteerPosition={volunteerCoords}
            volunteerPath={[]}
            className="h-64"
          />

        </div>

      </div>
    </div>
  );
}