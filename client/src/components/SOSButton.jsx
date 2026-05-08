// import { useState } from 'react';

// export default function SOSButton({ onTrigger, disabled, loading }) {
//   const [pressing, setPressing] = useState(false);
//   const [pressTimer, setPressTimer] = useState(null);

//   const startPress = () => {
//     if (disabled || loading) return;
//     setPressing(true);
//     const timer = setTimeout(() => {
//       setPressing(false);
//       onTrigger?.();
//       navigator.vibrate?.([100, 50, 100]);
//     }, 800); // Hold 800ms to trigger
//     setPressTimer(timer);
//   };

//   const cancelPress = () => {
//     setPressing(false);
//     if (pressTimer) clearTimeout(pressTimer);
//   };

//   return (
//     <div className="flex flex-col items-center gap-3">
//       <div className="relative flex items-center justify-center">
//         {/* Animated rings */}
//         {pressing && (
//           <>
//             <div className="absolute w-44 h-44 rounded-full bg-primary/10 animate-ping" />
//             <div className="absolute w-52 h-52 rounded-full bg-primary/5 animate-ping" style={{ animationDelay: '0.3s' }} />
//           </>
//         )}
//         {/* Outer ring */}
//         <div className="sos-ring relative flex items-center justify-center w-40 h-40 rounded-full bg-red-50">
//           <button
//             onMouseDown={startPress}
//             onMouseUp={cancelPress}
//             onMouseLeave={cancelPress}
//             onTouchStart={startPress}
//             onTouchEnd={cancelPress}
//             disabled={disabled || loading}
//             className={`
//               w-32 h-32 rounded-full font-bold text-2xl text-white tracking-widest
//               transition-all duration-150 select-none
//               ${pressing ? 'scale-95 bg-red-700' : 'bg-primary hover:bg-primary-dark active:scale-95'}
//               ${disabled ? 'opacity-50 cursor-not-allowed' : 'shadow-lg shadow-primary/30'}
//             `}
//           >
//             {loading ? (
//               <div className="w-8 h-8 border-3 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
//             ) : (
//               'SOS'
//             )}
//           </button>
//         </div>
//       </div>
//       <p className="text-xs text-gray-400 font-medium">
//         {pressing ? 'Keep holding...' : 'Hold to send SOS'}
//       </p>
//     </div>
//   );
// }












import { useState, useRef } from 'react';

export default function SOSButton({ onTrigger, disabled, loading }) {
  const [clicked, setClicked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef(null);
  const clickTimer = useRef(null);

  const handleClick = () => {
    if (disabled || loading) return;

    setClicked(true);
    onTrigger?.();
    navigator.vibrate?.([100, 50, 100]);

    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setClicked(false), 300);

    setShowToast(false);
    setTimeout(() => {
      setShowToast(true);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setShowToast(false), 3000);
    }, 10);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center">
          {/* Ripple rings on click */}
          {clicked && (
            <>
              <div className="absolute w-44 h-44 rounded-full border-2 border-red-400/40 animate-ping" />
              <div className="absolute w-52 h-52 rounded-full border-2 border-red-300/20 animate-ping" style={{ animationDelay: '0.15s' }} />
            </>
          )}

          {/* Outer ring */}
          <div className="relative flex items-center justify-center w-40 h-40 rounded-full bg-red-50">
            <button
              onClick={handleClick}
              disabled={disabled || loading}
              className={`
                w-32 h-32 rounded-full font-bold text-2xl text-white tracking-widest
                transition-all duration-150 select-none
                group
                ${clicked
                  ? 'scale-95 bg-red-800 shadow-md'
                  : 'bg-red-600 hover:bg-red-700 hover:scale-105 hover:shadow-red-400/50 hover:shadow-xl active:scale-95'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'shadow-lg shadow-red-500/30'}
              `}
            >
              {loading ? (
                <div className="w-8 h-8 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                'SOS'
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 font-medium">
          {clicked ? 'SOS sent!' : 'Click to send SOS'}
        </p>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg animate-fade-in-up">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          SOS alert sent!
        </div>
      )}
    </>
  );
}