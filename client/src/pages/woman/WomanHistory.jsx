// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { alertService } from '../../services/api';
// import { WomanNav } from '../../components/BottomNav';
// import { formatDistanceToNow } from 'date-fns';

// const statusConfig = {
//   pending:   { label: 'Searching',  cls: 'status-badge-pending', icon: '🔍' },
//   active:    { label: 'Active',     cls: 'status-badge-active',  icon: '🟢' },
//   resolved:  { label: 'Resolved',   cls: 'status-badge-resolved',icon: '✅' },
//   cancelled: { label: 'Cancelled',  cls: 'status-badge-cancelled',icon: '✕' },
//   expired:   { label: 'Expired',    cls: 'status-badge-cancelled',icon: '⏱' },
// };

// export default function WomanHistory() {
//   const [alerts, setAlerts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [pagination, setPagination] = useState({});
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetch = async () => {
//       setLoading(true);
//       try {
//         const { data } = await alertService.getMy({ page, limit: 10 });
//         setAlerts(data.alerts);
//         setPagination(data.pagination);
//       } catch {
//         // ignore
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetch();
//   }, [page]);

//   return (
//     <div className="min-h-screen bg-gray-50 pb-24">
//       <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
//         <h1 className="text-xl font-bold text-gray-900">Alert History</h1>
//         <p className="text-xs text-gray-500 mt-0.5">All your past SOS alerts</p>
//       </div>

//       <div className="px-5 pt-5">
//         {loading ? (
//           <div className="space-y-3">
//             {[...Array(4)].map((_, i) => (
//               <div key={i} className="card animate-pulse h-24 bg-gray-100" />
//             ))}
//           </div>
//         ) : alerts.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-20 gap-3">
//             <span className="text-5xl">📋</span>
//             <p className="text-gray-500 font-medium">No alerts yet</p>
//             <p className="text-xs text-gray-400">Your SOS history will appear here</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {alerts.map((alert) => {
//               const cfg = statusConfig[alert.status] || statusConfig.cancelled;
//               const canReview = alert.status === 'resolved' && !alert.hasReview && alert.volunteer;
//               return (
//                 <div key={alert._id} className="card">
//                   <div className="flex items-start justify-between gap-2">
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <span className={cfg.cls}>{cfg.icon} {cfg.label}</span>
//                         <span className="text-xs text-gray-400">
//                           {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-700 mt-2 font-medium line-clamp-1">
//                         "{alert.message}"
//                       </p>
//                       {alert.volunteer && (
//                         <p className="text-xs text-gray-500 mt-1">
//                           Helped by: <strong>{alert.volunteer.name}</strong>
//                         </p>
//                       )}
//                     </div>
//                     <span className="text-2xl">{cfg.icon}</span>
//                   </div>

//                   {canReview && (
//                     <button
//                       onClick={() => navigate(`/review/${alert._id}`)}
//                       className="mt-3 w-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold py-2 rounded-xl"
//                     >
//                       ⭐ Leave a Review
//                     </button>
//                   )}
//                   {alert.hasReview && (
//                     <p className="mt-2 text-xs text-green-600 font-medium">✅ Review submitted</p>
//                   )}
//                 </div>
//               );
//             })}

//             {/* Pagination */}
//             {pagination.pages > 1 && (
//               <div className="flex items-center justify-center gap-4 pt-2 pb-4">
//                 <button
//                   disabled={page === 1}
//                   onClick={() => setPage((p) => p - 1)}
//                   className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
//                 >← Prev</button>
//                 <span className="text-xs text-gray-500">{page} / {pagination.pages}</span>
//                 <button
//                   disabled={page === pagination.pages}
//                   onClick={() => setPage((p) => p + 1)}
//                   className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
//                 >Next →</button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       <WomanNav />
//     </div>
//   );
// }



import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

import { alertService } from '../../services/api';
import { WomanNav } from '../../components/BottomNav';

const statusConfig = {
  pending: {
    label: 'Searching Volunteers',
    icon: '🔍',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },

  active: {
    label: 'Help On The Way',
    icon: '🟢',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },

  resolved: {
    label: 'Resolved Successfully',
    icon: '✅',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },

  cancelled: {
    label: 'Cancelled',
    icon: '❌',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
  },

  expired: {
    label: 'Expired',
    icon: '⏱',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
};

export default function WomanHistory() {

  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({});

  // =====================================================
  // FETCH ALERTS
  // =====================================================

  useEffect(() => {

    const fetchAlerts = async () => {

      setLoading(true);

      try {

        const { data } =
          await alertService.getMy({
            page,
            limit: 10
          });

        setAlerts(data.alerts || []);

        setPagination(data.pagination || {});

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

    fetchAlerts();

  }, [page]);

  // =====================================================
  // STATS
  // =====================================================

  const stats = useMemo(() => {

    return {

      total: alerts.length,

      active: alerts.filter(
        a => a.status === 'active'
      ).length,

      resolved: alerts.filter(
        a => a.status === 'resolved'
      ).length,

      pending: alerts.filter(
        a => a.status === 'pending'
      ).length,
    };

  }, [alerts]);

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 pb-28">

      {/* HEADER */}

      <div className="bg-gradient-to-br from-primary via-red-500 to-orange-500 text-white px-5 pt-12 pb-10 rounded-b-[40px] shadow-xl">

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-xs uppercase tracking-widest text-white/70 font-semibold">
              SafeReach
            </p>

            <h1 className="text-3xl font-black mt-2">
              SOS History
            </h1>

            <p className="text-sm text-white/80 mt-2 leading-relaxed max-w-xs">
              View all your previous emergency alerts and volunteer responses.
            </p>
          </div>

          <div className="
            w-16 h-16
            rounded-3xl
            bg-white/15
            backdrop-blur
            flex items-center justify-center
            text-4xl
            shadow-lg
          ">
            🚨
          </div>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 gap-3 mt-8">

          <div className="
            bg-white/12
            backdrop-blur
            rounded-3xl
            p-4
            border border-white/10
          ">
            <p className="text-xs text-white/70">
              Total Alerts
            </p>

            <h2 className="text-3xl font-black mt-1">
              {stats.total}
            </h2>
          </div>

          <div className="
            bg-white/12
            backdrop-blur
            rounded-3xl
            p-4
            border border-white/10
          ">
            <p className="text-xs text-white/70">
              Resolved
            </p>

            <h2 className="text-3xl font-black mt-1">
              {stats.resolved}
            </h2>
          </div>

          <div className="
            bg-white/12
            backdrop-blur
            rounded-3xl
            p-4
            border border-white/10
          ">
            <p className="text-xs text-white/70">
              Active
            </p>

            <h2 className="text-3xl font-black mt-1">
              {stats.active}
            </h2>
          </div>

          <div className="
            bg-white/12
            backdrop-blur
            rounded-3xl
            p-4
            border border-white/10
          ">
            <p className="text-xs text-white/70">
              Pending
            </p>

            <h2 className="text-3xl font-black mt-1">
              {stats.pending}
            </h2>
          </div>
        </div>
      </div>

      {/* BODY */}

      <div className="px-5 pt-6">

        {/* LOADING */}

        {loading ? (

          <div className="space-y-5">

            {[...Array(4)].map((_, i) => (

              <div
                key={i}
                className="
                  h-52
                  rounded-[30px]
                  bg-white
                  animate-pulse
                  shadow-sm
                "
              />
            ))}
          </div>

        ) : alerts.length === 0 ? (

          /* EMPTY */

          <div className="
            bg-white
            rounded-[32px]
            p-10
            shadow-sm
            border border-gray-100
            text-center
          ">

            <div className="text-7xl mb-5">
              📋
            </div>

            <h2 className="text-2xl font-black text-gray-900">
              No SOS Alerts Yet
            </h2>

            <p className="text-gray-500 mt-3 text-sm leading-relaxed">
              Once you send an emergency alert,
              your activity and volunteer responses
              will appear here.
            </p>

            <button
              onClick={() => navigate('/home')}
              className="
                mt-7
                bg-primary
                text-white
                px-6
                py-3.5
                rounded-2xl
                font-bold
                shadow-lg
              "
            >
              Go Back Home
            </button>
          </div>

        ) : (

          /* ALERTS */

          <div className="space-y-5">

            {alerts.map((alert) => {

              const cfg =
                statusConfig[alert.status] ||
                statusConfig.cancelled;

              const canReview =
                alert.status === 'resolved' &&
                !alert.hasReview &&
                alert.volunteer;

              return (

                <div
                  key={alert._id}
                  className="
                    bg-white
                    rounded-[32px]
                    p-5
                    shadow-sm
                    border border-gray-100
                    overflow-hidden
                  "
                >

                  {/* TOP */}

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex-1 min-w-0">

                      <div
                        className={`
                          inline-flex
                          items-center
                          gap-2
                          px-4 py-2
                          rounded-full
                          border
                          text-xs
                          font-bold
                          ${cfg.bg}
                          ${cfg.color}
                          ${cfg.border}
                        `}
                      >
                        <span className="text-sm">
                          {cfg.icon}
                        </span>

                        {cfg.label}
                      </div>

                      <p className="text-xs text-gray-400 mt-3">
                        {formatDistanceToNow(
                          new Date(alert.createdAt),
                          { addSuffix: true }
                        )}
                      </p>
                    </div>

                    <div className="
                      w-14 h-14
                      rounded-2xl
                      bg-gray-50
                      flex items-center justify-center
                      text-3xl
                    ">
                      {cfg.icon}
                    </div>
                  </div>

                  {/* MESSAGE */}

                  <div className="
                    mt-5
                    rounded-3xl
                    bg-gray-50
                    border border-gray-100
                    p-4
                  ">

                    <p className="text-xs uppercase tracking-wide text-gray-400 font-bold">
                      Emergency Message
                    </p>

                    <p className="text-gray-800 font-semibold mt-2 leading-relaxed">
                      "
                      {
                        alert.message ||
                        'Emergency assistance required'
                      }
                      "
                    </p>
                  </div>

                  {/* VOLUNTEER */}

                  {alert.volunteer && (

                    <div className="
                      mt-5
                      bg-gradient-to-r
                      from-green-50
                      to-emerald-50
                      border border-green-100
                      rounded-3xl
                      p-4
                    ">

                      <div className="flex items-center justify-between gap-4">

                        <div>

                          <p className="text-xs text-green-600 font-bold uppercase tracking-wide">
                            Volunteer Responded
                          </p>

                          <h3 className="text-lg font-black text-gray-900 mt-1">
                            👤 {alert.volunteer.name}
                          </h3>

                          <p className="text-sm text-gray-600 mt-1">
                            Help was provided for this SOS alert
                          </p>
                        </div>

                        <div className="
                          w-12 h-12
                          rounded-2xl
                          bg-white
                          flex items-center justify-center
                          text-2xl
                          shadow-sm
                        ">
                          🤝
                        </div>
                      </div>
                    </div>
                  )}

                  {/* REVIEW */}

                  {canReview && (

                    <button
                      onClick={() =>
                        navigate(`/review/${alert._id}`)
                      }
                      className="
                        mt-5
                        w-full
                        bg-gradient-to-r
                        from-amber-400
                        to-orange-400
                        text-white
                        font-black
                        py-4
                        rounded-2xl
                        shadow-lg
                        active:scale-[0.99]
                        transition-all
                      "
                    >
                      ⭐ Leave Volunteer Review
                    </button>
                  )}

                  {/* REVIEW DONE */}

                  {alert.hasReview && (

                    <div className="
                      mt-5
                      bg-green-50
                      border border-green-200
                      rounded-2xl
                      px-4 py-4
                      text-green-700
                      font-bold
                      text-sm
                    ">
                      ✅ Review already submitted
                    </div>
                  )}
                </div>
              );
            })}

            {/* PAGINATION */}

            {pagination.pages > 1 && (

              <div className="flex items-center justify-center gap-4 pt-2">

                <button
                  disabled={page === 1}
                  onClick={() =>
                    setPage(prev => prev - 1)
                  }
                  className="
                    px-5 py-3
                    rounded-2xl
                    bg-white
                    border border-gray-200
                    font-semibold
                    text-sm
                    disabled:opacity-40
                  "
                >
                  ← Previous
                </button>

                <div className="
                  px-5 py-3
                  rounded-2xl
                  bg-white
                  border border-gray-200
                  text-sm
                  font-black
                ">
                  {page} / {pagination.pages}
                </div>

                <button
                  disabled={page === pagination.pages}
                  onClick={() =>
                    setPage(prev => prev + 1)
                  }
                  className="
                    px-5 py-3
                    rounded-2xl
                    bg-white
                    border border-gray-200
                    font-semibold
                    text-sm
                    disabled:opacity-40
                  "
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <WomanNav />

    </div>
  );
}