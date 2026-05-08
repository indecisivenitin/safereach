import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import useLocationBroadcast from '../../hooks/useLocationBroadcast';
import { VolunteerNav } from '../../components/BottomNav';

export default function VolunteerHome() {

  const navigate = useNavigate();

  const {
    socket,
    connected,
    emit,
    on,
    off
  } = useSocket();

  const [isAvailable, setIsAvailable] = useState(false);

  const [alerts, setAlerts] = useState([]);

  const [responseMessages, setResponseMessages] = useState({});

  const [processingAlert, setProcessingAlert] = useState(null);

  const [activeAcceptedAlert, setActiveAcceptedAlert] = useState(null);

  // =====================================================
  // LOCATION BROADCAST
  // =====================================================

  useLocationBroadcast({
    enabled:
      isAvailable &&
      !!activeAcceptedAlert,

    alertId:
      activeAcceptedAlert
  });

  // =====================================================
  // VOLUNTEER ACTIVE STATUS
  // =====================================================

  useEffect(() => {

    if (!connected) return;

    emit(
      'volunteer:toggle-status',
      { isActive: true }
    );

    setIsAvailable(true);

    return () => {

      emit(
        'volunteer:toggle-status',
        { isActive: false }
      );
    };

  }, [connected]);

  // =====================================================
  // LISTEN FOR NEW ALERTS
  // =====================================================

  useEffect(() => {

    if (!socket) return;

    const handleSOSAlert = (data) => {

      console.log(
        '🚨 NEW ALERT:',
        data
      );

      navigator.vibrate?.([
        200,
        100,
        200
      ]);

      // backend sends { alert: populatedAlert, ... }

      const incomingAlert = {
        ...data.alert,
        coordinates: data.coordinates,
        message: data.message,
        woman: data.woman
      };

      setAlerts(prev => {

        const exists = prev.some(
          item => item._id === incomingAlert._id
        );

        if (exists) return prev;

        return [
          incomingAlert,
          ...prev
        ];
      });

      toast.success(
        '🚨 New SOS Alert Received'
      );
    };

    // ✅ CORRECT EVENT NAME

    on(
      'new-alert',
      handleSOSAlert
    );

    return () => {

      off(
        'new-alert',
        handleSOSAlert
      );
    };

  }, [socket]);
  // =====================================================
  // QUICK REPLY
  // =====================================================

  const setQuickReply = (
    alertId,
    message
  ) => {

    setResponseMessages(prev => ({
      ...prev,
      [alertId]: message
    }));
  };

  // =====================================================
  // ACCEPT ALERT
  // =====================================================

  const handleAccept = (alertId) => {

    if (!alertId) {

      toast.error(
        'Invalid alert ID'
      );

      return;
    }

    setProcessingAlert(alertId);

    emit(
      'alert:accept',

      {
        alertId,

        responseMessage:
          responseMessages[alertId] ||
          'I am on my way. Stay safe.'
      },

      (response) => {

        setProcessingAlert(null);

        if (response?.success) {

          setActiveAcceptedAlert(
            alertId
          );

          toast.success(
            'Emergency accepted successfully'
          );

          setAlerts(prev =>
            prev.filter(
              alert =>
                alert._id !== alertId
            )
          );

          navigate(
            `/volunteer/active-alert/${alertId}`
          );

        } else {

          toast.error(
            response?.message ||
            'Failed to accept alert'
          );
        }
      }
    );
  };

  // =====================================================
  // REJECT ALERT
  // =====================================================

  const handleReject = (alertId) => {

    setAlerts(prev =>
      prev.filter(
        alert =>
          alert._id !== alertId
      )
    );

    emit(
      'alert:reject',
      { alertId }
    );

    toast(
      'Alert rejected',
      {
        icon: 'ℹ️'
      }
    );
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
            className={`
              px-4 py-2 rounded-full text-xs font-bold shadow-md
              ${connected
                ? 'bg-green-500'
                : 'bg-red-500'
              }
            `}
          >
            {
              connected
                ? 'ONLINE'
                : 'OFFLINE'
            }
          </div>
        </div>

        {/* STATUS */}

        <div className="mt-6 bg-white/10 backdrop-blur rounded-3xl p-4 border border-white/10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-white/70">
                Volunteer Status
              </p>

              <p className="font-semibold mt-1 text-lg">
                {
                  isAvailable
                    ? 'Available for Emergencies'
                    : 'Unavailable'
                }
              </p>
            </div>

            <div
              className={`
                w-4 h-4 rounded-full
                ${isAvailable
                  ? 'bg-green-400 animate-pulse'
                  : 'bg-gray-400'
                }
              `}
            />
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}

      <div className="px-5 mt-5">

        <div className="grid grid-cols-2 gap-4">

          <button
            onClick={() =>
              navigate('/volunteer/history')
            }
            className="
              bg-white
              rounded-3xl
              p-5
              shadow-sm
              border border-gray-100
              text-left
              active:scale-[0.98]
              transition-all
            "
          >
            <div className="text-3xl">
              📋
            </div>

            <h3 className="font-bold text-gray-900 mt-3">
              Alert History
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              View accepted emergencies
            </p>
          </button>

          <button
            onClick={() =>
              navigate('/volunteer/profile')
            }
            className="
              bg-white
              rounded-3xl
              p-5
              shadow-sm
              border border-gray-100
              text-left
              active:scale-[0.98]
              transition-all
            "
          >
            <div className="text-3xl">
              👤
            </div>

            <h3 className="font-bold text-gray-900 mt-3">
              My Profile
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Manage volunteer details
            </p>
          </button>
        </div>
      </div>

      {/* ALERTS */}

      <div className="px-5 mt-6">

        <div className="flex items-center justify-between mb-4">

          <h2 className="text-lg font-bold text-gray-900">
            Live SOS Alerts
          </h2>

          <div className="text-sm font-semibold text-primary">
            {alerts.length}
          </div>
        </div>

        {/* EMPTY */}

        {alerts.length === 0 && (

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">

            <div className="text-6xl mb-4">
              🚨
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              Waiting for SOS alerts
            </h2>

            <p className="text-gray-500 mt-2 text-sm">
              Nearby emergency requests will appear here instantly.
            </p>

            <div className="mt-6 text-xs text-gray-400">
              Keep your internet and location enabled.
            </div>
          </div>
        )}

        {/* ALERT LIST */}

        <div className="space-y-4">

          {alerts.map((alert, index) => (

            <div
              key={alert._id || index}
              className="bg-white rounded-3xl p-5 shadow-sm border border-red-100"
            >

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs uppercase tracking-wide text-red-500 font-bold">
                    Emergency SOS
                  </p>

                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    {
                      alert.woman?.name ||
                      'Woman in distress'
                    }
                  </h3>

                  <p className="text-sm text-gray-600 mt-3">
                    {
                      alert.message ||
                      'Emergency assistance required'
                    }
                  </p>

                  <div className="mt-4 text-xs text-gray-500 space-y-1">

                    <p>
                      Alert ID:
                      {' '}
                      {alert._id}
                    </p>

                    <p>
                      Coordinates:
                      {' '}
                      {
                        alert.coordinates?.join(', ')
                      }
                    </p>
                  </div>
                </div>

                <div className="animate-pulse text-4xl">
                  🚨
                </div>
              </div>

              {/* QUICK REPLIES */}

              <div className="mt-5 flex flex-wrap gap-2">

                {[
                  'On my way',
                  'Stay calm',
                  'Calling police',
                  'Reached nearby'
                ].map(msg => (

                  <button
                    key={msg}
                    onClick={() =>
                      setQuickReply(
                        alert._id,
                        msg
                      )
                    }
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium transition-all
                      ${responseMessages[alert._id] === msg
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {msg}
                  </button>
                ))}
              </div>

              {/* MESSAGE */}

              <textarea
                rows={2}
                placeholder="Send reassurance message..."
                value={
                  responseMessages[alert._id] || ''
                }
                onChange={(e) =>
                  setResponseMessages(prev => ({
                    ...prev,
                    [alert._id]: e.target.value
                  }))
                }
                className="
                  mt-4
                  w-full
                  rounded-2xl
                  border border-gray-200
                  px-4 py-3
                  text-sm
                  outline-none
                  focus:ring-2
                  focus:ring-primary/30
                "
              />

              {/* ACTIONS */}

              <div className="mt-5 grid grid-cols-2 gap-3">

                <button
                  onClick={() =>
                    handleReject(alert._id)
                  }
                  className="
                    py-3
                    rounded-2xl
                    border border-gray-200
                    text-gray-700
                    font-semibold
                    hover:bg-gray-50
                    transition-all
                  "
                >
                  Reject
                </button>

                <button
                  disabled={
                    processingAlert === alert._id
                  }
                  onClick={() =>
                    handleAccept(alert._id)
                  }
                  className="
                    bg-primary
                    hover:bg-primary-dark
                    text-white
                    font-bold
                    py-3
                    rounded-2xl
                    transition-all
                    disabled:opacity-50
                  "
                >
                  {
                    processingAlert === alert._id
                      ? 'Accepting...'
                      : 'Accept Alert'
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV */}

      <VolunteerNav />

    </div>
  );
}