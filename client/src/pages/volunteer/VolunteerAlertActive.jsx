import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useAlert } from '../../context/AlertContext';
import useLocationBroadcast from '../../hooks/useLocationBroadcast';
import LiveMap from '../../components/LiveMap';
import { VolunteerNav } from '../../components/BottomNav';
import { alertService } from '../../services/api';
import toast from 'react-hot-toast';

export default function VolunteerAlertActive() {

  const { id } = useParams();
  const navigate = useNavigate();

  const { on, off, emit } = useSocket();
  const { dispatch } = useAlert();

  const [womanCoords, setWomanCoords] = useState(null);
  const [volunteerCoords, setVolunteerCoords] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [resolved, setResolved] = useState(false);

  const watchIdRef = useRef(null);

  // =====================================================
  // VOLUNTEER LIVE LOCATION — watchPosition maximumAge:0
  // =====================================================

  useEffect(() => {

    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setVolunteerCoords([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.warn('GPS error:', err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };

  }, []);

  // =====================================================
  // BROADCAST VOLUNTEER LOCATION
  // =====================================================

  useLocationBroadcast({ enabled: !!id && !resolved, alertId: id });

  // =====================================================
  // JOIN ALERT ROOM + LOAD ALERT
  // =====================================================

  useEffect(() => {

    if (!id) return;

    emit('join-alert-room', { alertId: id });

    // Load alert data for woman's location
    alertService.getById(id)
      .then(({ data }) => {
        const coords = data.alert?.location?.coordinates;
        if (coords?.length === 2) {
          // coords is [lng, lat] — convert for Leaflet
          setWomanCoords([coords[1], coords[0]]);
        }
        setAlertData(data.alert);
      })
      .catch(console.error);

  }, [id, emit]);

  // =====================================================
  // LISTEN: ALERT RESOLVED BY WOMAN
  // =====================================================

  useEffect(() => {

    const handleResolved = () => {
      setResolved(true);
      toast.success('✅ Woman confirmed help received. Thank you!');
      dispatch({ type: 'CLEAR_ACCEPTED' });
      setTimeout(() => navigate('/volunteer/home'), 2000);
    };

    on('alert-resolved', handleResolved);
    return () => off('alert-resolved', handleResolved);

  }, [on, off, navigate, dispatch]);

  // =====================================================
  // LISTEN: ALERT CANCELLED
  // =====================================================

  useEffect(() => {

    const handleCancelled = () => {
      toast('Alert was cancelled by the woman.', { icon: 'ℹ️' });
      navigate('/volunteer/home');
    };

    on('alert-cancelled', handleCancelled);
    return () => off('alert-cancelled', handleCancelled);

  }, [on, off, navigate]);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* HEADER */}

      <div className="bg-gradient-to-r from-primary to-red-500 text-white px-5 pt-12 pb-8 rounded-b-[32px] shadow-lg">
        <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">Active Rescue</p>
        <h1 className="text-3xl font-bold mt-2">En Route 🏃</h1>
        <p className="text-sm text-white/80 mt-2">Your location is being shared in real-time</p>

        <div className="mt-4 bg-white/10 rounded-2xl p-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium">Live tracking active</span>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-5">

        {/* WOMAN INFO */}

        {alertData && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-bold mb-3">Woman in Need</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">🆘</div>
              <div>
                <h3 className="font-bold text-gray-900">{alertData.woman?.name}</h3>
                {alertData.woman?.phone && (
                  <a href={`tel:${alertData.woman.phone}`} className="text-sm text-primary font-medium mt-1 block">
                    📞 {alertData.woman.phone}
                  </a>
                )}
              </div>
            </div>
            {alertData.message && (
              <div className="mt-4 bg-red-50 rounded-2xl p-3">
                <p className="text-sm text-red-800">"{alertData.message}"</p>
              </div>
            )}
          </div>
        )}

        {/* LIVE MAP */}

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">📍 Live Map</h3>
            <span className="text-xs text-gray-400">Real-time</span>
          </div>
          <LiveMap
            womanPosition={womanCoords}
            volunteerPosition={volunteerCoords}
            volunteerPath={[]}
            className="h-72"
          />
        </div>

        {/* STATUS */}

        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4 text-center">
          <p className="text-sm text-blue-800 font-medium">
            {resolved ? '✅ Alert resolved. Redirecting...' : '🔄 Navigate to the woman\'s location shown on map'}
          </p>
        </div>
      </div>

      <VolunteerNav />
    </div>
  );
}