


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertService } from '../../services/api';
import { VolunteerNav } from '../../components/BottomNav';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  active: { label: 'In Progress', cls: 'status-badge-active', icon: '🏃' },
  resolved: { label: 'Completed', cls: 'status-badge-resolved', icon: '✅' },
  cancelled: { label: 'Cancelled', cls: 'status-badge-cancelled', icon: '✕' },
  expired: { label: 'Expired', cls: 'status-badge-cancelled', icon: '⏱' },
};

export default function VolunteerHistory() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState('all'); // all, completed, cancelled
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const { data } = await alertService.getMyAlerts({ 
          page, 
          limit: 10,
          status: filter === 'all' ? undefined : filter,
        });
        setAlerts(data.alerts || []);
        setPagination(data.pagination || {});
      } catch (err) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [page, filter]);

  const stats = {
    total: alerts.reduce((sum) => sum + 1, 0),
    completed: alerts.filter((a) => a.status === 'resolved').length,
    avgRating: alerts.length > 0 
      ? (alerts.filter((a) => a.rating).reduce((sum, a) => sum + a.rating, 0) / alerts.filter((a) => a.rating).length).toFixed(1)
      : 0,
  };

  const filters = [
    { id: 'all', label: 'All Alerts', icon: '📋' },
    { id: 'resolved', label: 'Completed', icon: '✅' },
    { id: 'cancelled', label: 'Cancelled', icon: '✕' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Your Activity</h1>
        <p className="text-xs text-gray-500 mt-0.5">Alerts you've responded to</p>
      </div>

      <div className="px-5 pt-5 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total Alerts</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-amber-500">{stats.avgRating}</p>
            <p className="text-xs text-gray-500 mt-1">Avg Rating</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filter === f.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-primary'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse h-24 bg-gray-100" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl">🎯</span>
            <p className="text-gray-500 font-medium">No alerts found</p>
            <p className="text-xs text-gray-400">Alerts will appear here as you help people</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const cfg = statusConfig[alert.status] || statusConfig.cancelled;
              const womanName = alert.woman?.name || 'Unknown';
              
              return (
                <div 
                  key={alert._id} 
                  onClick={() => navigate(`/volunteer/alert/${alert._id}`)}
                  className="card cursor-pointer hover:shadow-md hover:border-primary/30 transition-all border"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cfg.cls}>{cfg.icon} {cfg.label}</span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {alert.message && (
                        <p className="text-sm text-gray-700 mt-2 font-medium line-clamp-1">
                          "{alert.message}"
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          👩 {womanName}
                        </span>
                        {alert.timeSpent && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            ⏱ {Math.round(alert.timeSpent / 60)}m
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-2xl flex-shrink-0">{cfg.icon}</span>
                  </div>

                  {/* Rating display for completed alerts */}
                  {alert.status === 'resolved' && alert.rating && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-gray-600">Rating received:</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-sm">
                            {i < Math.round(alert.rating) ? '⭐' : '☆'}
                          </span>
                        ))}
                        <span className="text-xs text-gray-500 ml-1">{alert.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}

                  {alert.review && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                      <p className="text-xs font-semibold text-amber-900">Review from {womanName}:</p>
                      <p className="text-xs text-amber-800 mt-1 line-clamp-2">"{alert.review}"</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4 pb-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-xs text-gray-500">{page} / {pagination.pages}</span>
                <button
                  disabled={page === pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <VolunteerNav />
    </div>
  );
}









// import { useEffect, useMemo, useState } from 'react';

// import { useNavigate } from 'react-router-dom';

// import { alertService } from '../../services/api';

// import { VolunteerNav } from '../../components/BottomNav';

// import { formatDistanceToNow } from 'date-fns';

// const statusConfig = {
//   active: {
//     label: 'In Progress',
//     cls: 'bg-blue-100 text-blue-700',
//     icon: '🏃',
//   },

//   resolved: {
//     label: 'Completed',
//     cls: 'bg-green-100 text-green-700',
//     icon: '✅',
//   },

//   cancelled: {
//     label: 'Cancelled',
//     cls: 'bg-red-100 text-red-700',
//     icon: '✕',
//   },

//   expired: {
//     label: 'Expired',
//     cls: 'bg-gray-200 text-gray-700',
//     icon: '⏱',
//   },
// };

// export default function VolunteerHistory() {

//   const navigate = useNavigate();

//   const [alerts, setAlerts] = useState([]);

//   const [loading, setLoading] = useState(true);

//   const [page, setPage] = useState(1);

//   const [pagination, setPagination] = useState({});

//   const [filter, setFilter] = useState('all');

//   // =====================================================
//   // FETCH ALERTS
//   // =====================================================

//   useEffect(() => {

//     const fetchAlerts = async () => {

//       try {

//         setLoading(true);

//         const query = {
//           page,
//           limit: 10,
//         };

//         if (filter !== 'all') {
//           query.status = filter;
//         }

//         const response =
//           await alertService.getMyAlerts(query);

//         const data = response.data;

//         setAlerts(data.alerts || []);

//         setPagination(data.pagination || {});

//       } catch (err) {

//         console.error(
//           'Volunteer history error:',
//           err
//         );

//       } finally {

//         setLoading(false);
//       }
//     };

//     fetchAlerts();

//   }, [page, filter]);

//   // =====================================================
//   // STATS
//   // =====================================================

//   const stats = useMemo(() => {

//     const completedAlerts =
//       alerts.filter(
//         (a) => a.status === 'resolved'
//       );

//     const ratings =
//       completedAlerts.filter(
//         (a) => a.rating
//       );

//     const avgRating =
//       ratings.length > 0
//         ? (
//             ratings.reduce(
//               (sum, a) => sum + a.rating,
//               0
//             ) / ratings.length
//           ).toFixed(1)
//         : '0.0';

//     return {
//       total: alerts.length,
//       completed: completedAlerts.length,
//       avgRating,
//     };

//   }, [alerts]);

//   // =====================================================
//   // FILTERS
//   // =====================================================

//   const filters = [
//     {
//       id: 'all',
//       label: 'All',
//       icon: '📋',
//     },

//     {
//       id: 'resolved',
//       label: 'Completed',
//       icon: '✅',
//     },

//     {
//       id: 'cancelled',
//       label: 'Cancelled',
//       icon: '✕',
//     },
//   ];

//   // =====================================================
//   // UI
//   // =====================================================

//   return (
//     <div className="min-h-screen bg-gray-50 pb-24">

//       {/* HEADER */}

//       <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-5">

//         <h1 className="text-2xl font-bold text-gray-900">
//           Volunteer History
//         </h1>

//         <p className="text-sm text-gray-500 mt-1">
//           Your completed and active emergency responses
//         </p>
//       </div>

//       <div className="px-5 py-5 space-y-5">

//         {/* STATS */}

//         <div className="grid grid-cols-3 gap-3">

//           <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 text-center">

//             <p className="text-3xl font-bold text-gray-900">
//               {stats.total}
//             </p>

//             <p className="text-xs text-gray-500 mt-1">
//               Total Alerts
//             </p>
//           </div>

//           <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 text-center">

//             <p className="text-3xl font-bold text-green-600">
//               {stats.completed}
//             </p>

//             <p className="text-xs text-gray-500 mt-1">
//               Completed
//             </p>
//           </div>

//           <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 text-center">

//             <p className="text-3xl font-bold text-amber-500">
//               {stats.avgRating}
//             </p>

//             <p className="text-xs text-gray-500 mt-1">
//               Avg Rating
//             </p>
//           </div>
//         </div>

//         {/* FILTERS */}

//         <div className="flex items-center gap-2 overflow-x-auto pb-1">

//           {filters.map((f) => (

//             <button
//               key={f.id}

//               onClick={() => {

//                 setFilter(f.id);

//                 setPage(1);
//               }}

//               className={`
//                 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all
//                 ${
//                   filter === f.id
//                     ? 'bg-primary text-white shadow-md'
//                     : 'bg-white border border-gray-200 text-gray-700'
//                 }
//               `}
//             >
//               {f.icon} {f.label}
//             </button>
//           ))}
//         </div>

//         {/* LOADING */}

//         {loading && (

//           <div className="space-y-4">

//             {[1, 2, 3].map((i) => (

//               <div
//                 key={i}
//                 className="
//                   bg-white
//                   rounded-3xl
//                   h-32
//                   animate-pulse
//                   border border-gray-100
//                 "
//               />
//             ))}
//           </div>
//         )}

//         {/* EMPTY */}

//         {!loading && alerts.length === 0 && (

//           <div className="
//             bg-white
//             rounded-3xl
//             p-10
//             text-center
//             border border-gray-100
//             shadow-sm
//           ">

//             <div className="text-6xl mb-4">
//               🎯
//             </div>

//             <h2 className="text-xl font-bold text-gray-800">
//               No alert history yet
//             </h2>

//             <p className="text-sm text-gray-500 mt-2">
//               Your accepted emergency requests will appear here.
//             </p>
//           </div>
//         )}

//         {/* ALERTS */}

//         {!loading && alerts.length > 0 && (

//           <div className="space-y-4">

//             {alerts.map((alert) => {

//               const cfg =
//                 statusConfig[alert.status] ||
//                 statusConfig.cancelled;

//               const womanName =
//                 alert.woman?.name ||
//                 'Unknown';

//               const rating =
//                 alert.rating || 0;

//               return (

//                 <div
//                   key={alert._id}

//                   onClick={() =>
//                     navigate(
//                       `/volunteer/alert/${alert._id}`
//                     )
//                   }

//                   className="
//                     bg-white
//                     rounded-3xl
//                     p-5
//                     shadow-sm
//                     border border-gray-100
//                     cursor-pointer
//                     hover:shadow-md
//                     transition-all
//                   "
//                 >

//                   {/* TOP */}

//                   <div className="flex items-start justify-between gap-3">

//                     <div className="flex-1 min-w-0">

//                       <div className="flex items-center gap-2 flex-wrap">

//                         <span
//                           className={`
//                             px-3 py-1 rounded-full text-xs font-bold
//                             ${cfg.cls}
//                           `}
//                         >
//                           {cfg.icon} {cfg.label}
//                         </span>

//                         <span className="text-xs text-gray-400">
//                           {formatDistanceToNow(
//                             new Date(alert.createdAt),
//                             { addSuffix: true }
//                           )}
//                         </span>
//                       </div>

//                       <h3 className="text-lg font-bold text-gray-900 mt-3">

//                         {womanName}
//                       </h3>

//                       {alert.message && (

//                         <p className="text-sm text-gray-600 mt-2 line-clamp-2">
//                           "{alert.message}"
//                         </p>
//                       )}

//                       <div className="flex flex-wrap gap-2 mt-4">

//                         <span className="
//                           text-xs
//                           bg-blue-50
//                           text-blue-700
//                           px-3
//                           py-1
//                           rounded-full
//                           font-medium
//                         ">
//                           👩 Woman Alert
//                         </span>

//                         {alert.helpDuration && (

//                           <span className="
//                             text-xs
//                             bg-gray-100
//                             text-gray-700
//                             px-3
//                             py-1
//                             rounded-full
//                             font-medium
//                           ">
//                             ⏱ {alert.helpDuration} mins
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     <div className="text-4xl">
//                       {cfg.icon}
//                     </div>
//                   </div>

//                   {/* RATING */}

//                   {alert.status === 'resolved' && (

//                     <div className="mt-5 pt-4 border-t border-gray-100">

//                       <div className="flex items-center justify-between">

//                         <div>

//                           <p className="text-xs text-gray-500 font-medium">
//                             Rating received
//                           </p>

//                           <div className="flex items-center gap-1 mt-1">

//                             {[1, 2, 3, 4, 5].map((star) => (

//                               <span
//                                 key={star}
//                                 className="text-lg"
//                               >
//                                 {star <= rating
//                                   ? '⭐'
//                                   : '☆'}
//                               </span>
//                             ))}

//                             <span className="ml-2 text-sm font-semibold text-gray-700">
//                               {rating
//                                 ? rating.toFixed(1)
//                                 : 'No rating'}
//                             </span>
//                           </div>
//                         </div>

//                         {rating >= 4 && (

//                           <div className="
//                             px-3 py-1
//                             rounded-full
//                             bg-green-100
//                             text-green-700
//                             text-xs
//                             font-bold
//                           ">
//                             Trusted Volunteer
//                           </div>
//                         )}
//                       </div>

//                       {alert.review && (

//                         <div className="
//                           mt-4
//                           bg-amber-50
//                           border border-amber-100
//                           rounded-2xl
//                           p-3
//                         ">

//                           <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
//                             Review
//                           </p>

//                           <p className="text-sm text-amber-900 mt-1">
//                             "{alert.review}"
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}

//             {/* PAGINATION */}

//             {pagination.pages > 1 && (

//               <div className="flex items-center justify-center gap-4 pt-2">

//                 <button
//                   disabled={page === 1}

//                   onClick={() =>
//                     setPage((p) => p - 1)
//                   }

//                   className="
//                     px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium disabled:opacity-40
//                   "
//                 >
//                   ← Prev
//                 </button>

//                 <span className="text-sm text-gray-500">
//                   Page {page} / {pagination.pages}
//                 </span>

//                 <button
//                   disabled={
//                     page === pagination.pages
//                   }

//                   onClick={() =>
//                     setPage((p) => p + 1)
//                   }

//                   className="
//                     px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium disabled:opacity-40
//                   "
//                 >
//                   Next →
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       <VolunteerNav />
//     </div>
//   );
// }