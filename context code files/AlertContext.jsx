
// import {
//   createContext,
//   useContext,
//   useReducer,
//   useEffect
// } from 'react';

// import { useSocket } from './SocketContext';
// import { useAuth } from './AuthContext';

// import toast from 'react-hot-toast';

// const AlertContext =
//   createContext(null);

// // =====================================================
// // INITIAL STATE
// // =====================================================

// const initialState = {

//   activeAlert: null,

//   incomingAlert: null,

//   acceptedAlert: null,

//   volunteerLocation: null,

//   volunteerPath: [],

//   volunteerResponseMessage: null,

//   volunteerProfile: null,

//   status: 'idle',
// };

// // =====================================================
// // REDUCER
// // =====================================================

// const reducer = (
//   state,
//   action
// ) => {

//   switch (action.type) {

//     // =================================================
//     // ALERT CREATED
//     // =================================================

//     case 'ALERT_CREATED':

//       return {

//         ...state,

//         activeAlert:
//           action.payload,

//         status: 'searching'
//       };

//     // =================================================
//     // ALERT ACCEPTED
//     // =================================================

//     case 'ALERT_ACCEPTED':

//       return {

//         ...state,

//         status: 'active',

//         volunteerProfile:
//           action.payload.volunteer,

//         volunteerResponseMessage:
//           action.payload.responseMessage || '',

//         volunteerLocation:
//           action.payload.volunteer?.location
//             ?.coordinates || null,

//         activeAlert: {

//           ...state.activeAlert,

//           volunteer:
//             action.payload.volunteer,

//           acceptedAt:
//             action.payload.acceptedAt
//         }
//       };

//     // =================================================
//     // VOLUNTEER LIVE LOCATION
//     // =================================================

//     case 'VOLUNTEER_LOCATION_UPDATE':

//       return {

//         ...state,

//         volunteerLocation:
//           action.payload,

//         volunteerPath: [

//           ...state.volunteerPath,

//           action.payload
//         ]
//       };

//     // =================================================
//     // ALERT RESOLVED
//     // =================================================

//     case 'ALERT_RESOLVED':

//       return {

//         ...state,

//         status: 'resolved'
//       };

//     // =================================================
//     // ALERT CANCELLED
//     // =================================================

//     case 'ALERT_CANCELLED':

//       return {

//         ...state,

//         activeAlert: null,

//         acceptedAlert: null,

//         volunteerLocation: null,

//         volunteerPath: [],

//         volunteerProfile: null,

//         volunteerResponseMessage: null,

//         status: 'idle'
//       };

//     // =================================================
//     // VOLUNTEER RECEIVES ALERT
//     // =================================================

//     case 'INCOMING_ALERT':

//       return {

//         ...state,

//         incomingAlert:
//           action.payload
//       };

//     // =================================================
//     // CLEAR INCOMING
//     // =================================================

//     case 'CLEAR_INCOMING':

//       return {

//         ...state,

//         incomingAlert: null
//       };

//     // =================================================
//     // SET ACCEPTED ALERT
//     // =================================================

//     case 'SET_ACCEPTED':

//       return {

//         ...state,

//         acceptedAlert:
//           action.payload
//       };

//     // =================================================
//     // CLEAR ACCEPTED
//     // =================================================

//     case 'CLEAR_ACCEPTED':

//       return {

//         ...state,

//         acceptedAlert: null
//       };

//     // =================================================
//     // RESET
//     // =================================================

//     case 'RESET':

//       return initialState;

//     default:
//       return state;
//   }
// };

// // =====================================================
// // PROVIDER
// // =====================================================

// export const AlertProvider = ({
//   children
// }) => {

//   const [state, dispatch] =
//     useReducer(
//       reducer,
//       initialState
//     );

//   const {
//     on,
//     off
//   } = useSocket();

//   const { user } = useAuth();

//   // =====================================================
//   // SOCKET EVENTS
//   // =====================================================

//   useEffect(() => {

//     if (!user) return;

//     // ---------------------------------------------------
//     // WOMAN: ALERT ACCEPTED
//     // ---------------------------------------------------

//     const onAlertAccepted = (
//       data
//     ) => {

//       console.log(
//         '✅ ALERT ACCEPTED (Woman Side):',
//         data
//       );

//       // ✅ FIX: Only woman receives this
//       if (user.role !== 'woman') {
//         console.log('User is not a woman, ignoring alert:accepted');
//         return;
//       }

//       dispatch({
//         type: 'ALERT_ACCEPTED',
//         payload: data
//       });

//       toast.success(
//         `🙋 ${data.volunteer.name} is on the way!`,
//         {
//           duration: 6000
//         }
//       );
//     };

//     // ---------------------------------------------------
//     // LIVE VOLUNTEER LOCATION
//     // ---------------------------------------------------

//     const onVolunteerLocation =
//       (data) => {

//         console.log(
//           '📍 LIVE VOLUNTEER LOCATION:',
//           data
//         );

//         dispatch({
//           type:
//             'VOLUNTEER_LOCATION_UPDATE',

//           payload:
//             data.coordinates
//         });
//       };

//     // ---------------------------------------------------
//     // ALERT RESOLVED
//     // ---------------------------------------------------

//     const onAlertResolved =
//       () => {

//         dispatch({
//           type:
//             'ALERT_RESOLVED'
//         });

//         toast.success(
//           '✅ Help has arrived'
//         );
//       };

//     // ---------------------------------------------------
//     // ALERT CANCELLED
//     // ---------------------------------------------------

//     const onAlertCancelled =
//       () => {

//         dispatch({
//           type:
//             'ALERT_CANCELLED'
//         });

//         toast(
//           'Alert was cancelled',
//           {
//             icon: 'ℹ️'
//           }
//         );
//       };

//     // ---------------------------------------------------
//     // VOLUNTEER: NEW ALERT
//     // ---------------------------------------------------

//     const onNewAlert = (
//       data
//     ) => {

//       // ✅ FIX: Only volunteers receive this
//       if (
//         user.role !==
//         'volunteer'
//       ) {
//         console.log('User is not a volunteer, ignoring new-sos-alert');
//         return;
//       }

//       console.log(
//         '🚨 NEW ALERT (Volunteer):',
//         data
//       );

//       dispatch({
//         type:
//           'INCOMING_ALERT',

//         payload: data
//       });

//       toast(
//         '🆘 New SOS alert nearby!',
//         {
//           duration: 8000,
//           icon: '🚨'
//         }
//       );

//       navigator.vibrate?.([
//         200,
//         100,
//         200,
//         100,
//         200
//       ]);
//     };

//     // ---------------------------------------------------
//     // VOLUNTEER: ALERT RESOLVED
//     // ---------------------------------------------------

//     const onAlertResolvedForVolunteer =
//       () => {

//         dispatch({
//           type:
//             'CLEAR_ACCEPTED'
//         });

//         toast.success(
//           '✅ Woman confirmed help received. Thank you!',
//           {
//             duration: 5000
//           }
//         );
//       };

//     // =================================================
//     // SOCKET LISTENERS
//     // =================================================

//     on(
//       'alert:accepted',
//       onAlertAccepted
//     );

//     on(
//       'volunteer-location-update',
//       onVolunteerLocation
//     );

//     on(
//       'alert-resolved',
//       onAlertResolved
//     );

//     on(
//       'alert-cancelled',
//       onAlertCancelled
//     );

//     on(
//       'new-sos-alert',
//       onNewAlert
//     );

//     on(
//       'alert-resolved',
//       onAlertResolvedForVolunteer
//     );

//     // =================================================
//     // CLEANUP
//     // =================================================

//     return () => {

//       off(
//         'alert:accepted',
//         onAlertAccepted
//       );

//       off(
//         'volunteer-location-update',
//         onVolunteerLocation
//       );

//       off(
//         'alert-resolved',
//         onAlertResolved
//       );

//       off(
//         'alert-cancelled',
//         onAlertCancelled
//       );

//       off(
//         'new-sos-alert',
//         onNewAlert
//       );

//       off(
//         'alert-resolved',
//         onAlertResolvedForVolunteer
//       );
//     };

//   }, [on, off, user]);

//   // =====================================================
//   // CONTEXT
//   // =====================================================

//   return (

//     <AlertContext.Provider
//       value={{
//         ...state,
//         dispatch
//       }}
//     >

//       {children}

//     </AlertContext.Provider>
//   );
// };

// // =====================================================
// // HOOK
// // =====================================================

// export const useAlert = () =>
//   useContext(AlertContext);





import {
  createContext,
  useContext,
  useReducer,
  useEffect
} from 'react';

import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

import toast from 'react-hot-toast';

const AlertContext =
  createContext(null);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {

  activeAlert: null,

  incomingAlert: null,

  acceptedAlert: null,

  volunteerLocation: null,

  volunteerPath: [],

  volunteerResponseMessage: null,

  volunteerProfile: null,

  status: 'idle',

  messages: [],
};

// =====================================================
// REDUCER
// =====================================================

const reducer = (
  state,
  action
) => {

  switch (action.type) {

    // =================================================
    // ALERT CREATED
    // =================================================

    case 'ALERT_CREATED':

      return {

        ...state,

        activeAlert:
          action.payload,

        status: 'searching'
      };

    // =================================================
    // ALERT ACCEPTED
    // =================================================

    case 'ALERT_ACCEPTED':

      return {

        ...state,

        status: 'active',

        volunteerProfile:
          action.payload.volunteer,

        volunteerResponseMessage:
          action.payload.responseMessage || '',

        volunteerLocation:
          action.payload.volunteer?.location
            ?.coordinates || null,

        activeAlert: {

          ...state.activeAlert,

          volunteer:
            action.payload.volunteer,

          acceptedAt:
            action.payload.acceptedAt
        }
      };

    // =================================================
    // VOLUNTEER LIVE LOCATION
    // =================================================

    case 'VOLUNTEER_LOCATION_UPDATE':

      return {

        ...state,

        volunteerLocation:
          action.payload,

        volunteerPath: [

          ...state.volunteerPath,

          action.payload
        ]
      };

    // =================================================
    // ALERT RESOLVED
    // =================================================

    case 'ALERT_RESOLVED':

      return {

        ...state,

        status: 'resolved'
      };

    // =================================================
    // ALERT CANCELLED
    // =================================================

    case 'ALERT_CANCELLED':

      return {

        ...state,

        activeAlert: null,

        acceptedAlert: null,

        volunteerLocation: null,

        volunteerPath: [],

        volunteerProfile: null,

        volunteerResponseMessage: null,

        messages: [],

        status: 'idle'
      };

    // =================================================
    // VOLUNTEER RECEIVES ALERT
    // =================================================

    case 'INCOMING_ALERT':

      return {

        ...state,

        incomingAlert:
          action.payload
      };

    // =================================================
    // CLEAR INCOMING
    // =================================================

    case 'CLEAR_INCOMING':

      return {

        ...state,

        incomingAlert: null
      };

    // =================================================
    // SET ACCEPTED ALERT
    // =================================================

    case 'SET_ACCEPTED':

      return {

        ...state,

        acceptedAlert:
          action.payload
      };

    // =================================================
    // CLEAR ACCEPTED
    // =================================================

    case 'CLEAR_ACCEPTED':

      return {

        ...state,

        acceptedAlert: null
      };

    // =================================================
    // RESET
    // =================================================

    case 'RESET':

      return initialState;

    // =================================================
    // CHAT HISTORY LOADED
    // =================================================

    case 'CHAT_HISTORY_LOADED':

      return {

        ...state,

        messages: action.payload
      };

    // =================================================
    // CHAT MESSAGE RECEIVED
    // =================================================

    case 'CHAT_MESSAGE_RECEIVED':

      return {

        ...state,

        messages: [

          ...state.messages,

          action.payload
        ]
      };

    default:
      return state;
  }
};

// =====================================================
// PROVIDER
// =====================================================

export const AlertProvider = ({
  children
}) => {

  const [state, dispatch] =
    useReducer(
      reducer,
      initialState
    );

  const {
    on,
    off
  } = useSocket();

  const { user } = useAuth();

  // =====================================================
  // SOCKET EVENTS
  // =====================================================

  useEffect(() => {

    if (!user) return;

    // ---------------------------------------------------
    // WOMAN: ALERT ACCEPTED
    // ---------------------------------------------------

    const onAlertAccepted = (
      data
    ) => {

      console.log(
        '✅ ALERT ACCEPTED (Woman Side):',
        data
      );

      // ✅ FIX: Only woman receives this
      if (user.role !== 'woman') {
        console.log('User is not a woman, ignoring alert:accepted');
        return;
      }

      dispatch({
        type: 'ALERT_ACCEPTED',
        payload: data
      });

      toast.success(
        `🙋 ${data.volunteer.name} is on the way!`,
        {
          duration: 6000
        }
      );
    };

    // ---------------------------------------------------
    // LIVE VOLUNTEER LOCATION
    // ---------------------------------------------------

    const onVolunteerLocation =
      (data) => {

        console.log(
          '📍 LIVE VOLUNTEER LOCATION:',
          data
        );

        dispatch({
          type:
            'VOLUNTEER_LOCATION_UPDATE',

          payload:
            data.coordinates
        });
      };

    // ---------------------------------------------------
    // ALERT RESOLVED
    // ---------------------------------------------------

    const onAlertResolved =
      () => {

        dispatch({
          type:
            'ALERT_RESOLVED'
        });

        toast.success(
          '✅ Help has arrived'
        );
      };

    // ---------------------------------------------------
    // ALERT CANCELLED
    // ---------------------------------------------------

    const onAlertCancelled =
      () => {

        dispatch({
          type:
            'ALERT_CANCELLED'
        });

        toast(
          'Alert was cancelled',
          {
            icon: 'ℹ️'
          }
        );
      };

    // ---------------------------------------------------
    // VOLUNTEER: NEW ALERT
    // ---------------------------------------------------

    const onNewAlert = (
      data
    ) => {

      // ✅ FIX: Only volunteers receive this
      if (
        user.role !==
        'volunteer'
      ) {
        console.log('User is not a volunteer, ignoring new-sos-alert');
        return;
      }

      console.log(
        '🚨 NEW ALERT (Volunteer):',
        data
      );

      dispatch({
        type:
          'INCOMING_ALERT',

        payload: data
      });

      toast(
        '🆘 New SOS alert nearby!',
        {
          duration: 8000,
          icon: '🚨'
        }
      );

      navigator.vibrate?.([
        200,
        100,
        200,
        100,
        200
      ]);
    };

    // ---------------------------------------------------
    // VOLUNTEER: ALERT RESOLVED
    // ---------------------------------------------------

    const onAlertResolvedForVolunteer =
      () => {

        dispatch({
          type:
            'CLEAR_ACCEPTED'
        });

        toast.success(
          '✅ Woman confirmed help received. Thank you!',
          {
            duration: 5000
          }
        );
      };

    // ---------------------------------------------------
    // CHAT: NEW MESSAGE
    // ---------------------------------------------------

    const onChatNewMessage = (data) => {

      console.log(
        '💬 NEW CHAT MESSAGE:',
        data
      );

      dispatch({
        type: 'CHAT_MESSAGE_RECEIVED',
        payload: data
      });
    };

    // =================================================
    // SOCKET LISTENERS
    // =================================================

    on(
      'alert:accepted',
      onAlertAccepted
    );

    on(
      'volunteer-location-update',
      onVolunteerLocation
    );

    on(
      'alert-resolved',
      onAlertResolved
    );

    on(
      'alert-cancelled',
      onAlertCancelled
    );

    on(
      'new-sos-alert',
      onNewAlert
    );

    on(
      'alert-resolved',
      onAlertResolvedForVolunteer
    );

    on(
      'chat:new-message',
      onChatNewMessage
    );

    // =================================================
    // CLEANUP
    // =================================================

    return () => {

      off(
        'alert:accepted',
        onAlertAccepted
      );

      off(
        'volunteer-location-update',
        onVolunteerLocation
      );

      off(
        'alert-resolved',
        onAlertResolved
      );

      off(
        'alert-cancelled',
        onAlertCancelled
      );

      off(
        'new-sos-alert',
        onNewAlert
      );

      off(
        'alert-resolved',
        onAlertResolvedForVolunteer
      );

      off(
        'chat:new-message',
        onChatNewMessage
      );
    };

  }, [on, off, user]);

  // =====================================================
  // CONTEXT
  // =====================================================

  return (

    <AlertContext.Provider
      value={{
        ...state,
        dispatch
      }}
    >

      {children}

    </AlertContext.Provider>
  );
};

// =====================================================
// HOOK
// =====================================================

export const useAlert = () =>
  useContext(AlertContext);