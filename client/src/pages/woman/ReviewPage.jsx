
// const ReviewPage = () => {
//   return (
//     <div>
//       hi
//     </div>
//   )
// }

// export default ReviewPage


// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { alertService } from '../../services/api';
// import toast from 'react-hot-toast';

// export default function ReviewPage() {
// const { alertId } = useParams();  const navigate = useNavigate();
//   const [alert, setAlert] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [rating, setRating] = useState(5);
//   const [review, setReview] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     const fetchAlert = async () => {
//       try {
//         setLoading(true);
//         // Fetch alert details to get volunteer info
//         // This would typically come from API: const { data } = await alertService.getById(alert._id);
//         // For now using mock structure
//         setAlert({
//           _id: alert._id,
//           volunteer: {
//             _id: '1',
//             name: 'John Doe',
//             rating: 4.8,
//             totalReviews: 24,
//           },
//           status: 'resolved',
//         });
//       } catch (err) {
//         toast.error('Failed to load alert details');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAlert();
//   }, [alert._id]);

//   const handleSubmitReview = async () => {
//     if (rating === 0) {
//       toast.error('Please select a rating');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       // await alertService.submitReview(alert._id, { rating, review });
//       // Mock submission for now
//       await new Promise((resolve) => setTimeout(resolve, 1500));
      
//       toast.success('Thank you for your feedback!');
//       navigate('/home');
//     } catch (err) {
//       toast.error(err.message || 'Failed to submit review');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 pb-24 px-5 pt-12">
//         <div className="space-y-4">
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="card h-20 animate-pulse bg-gray-100" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   const volunteer = alert?.volunteer;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-amber-50 to-gray-50">
//       {/* Header */}
//       <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
//         <button
//           onClick={() => navigate(-1)}
//           className="text-gray-400 hover:text-gray-600 mb-3"
//         >
//           ← Back
//         </button>
//         <h1 className="text-xl font-bold text-gray-900">Rate Your Experience</h1>
//         <p className="text-xs text-gray-500 mt-0.5">Help us improve our service</p>
//       </div>

//       <div className="px-5 pt-8 pb-12 space-y-6">
//         {/* Volunteer Card */}
//         {volunteer && (
//           <div className="card border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
//             <div className="flex items-center gap-4">
//               <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center text-3xl flex-shrink-0 border-2 border-amber-200">
//                 🙋
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-bold text-gray-900">{volunteer.name}</p>
//                 <div className="flex items-center gap-1 mt-1">
//                   {[...Array(5)].map((_, i) => (
//                     <span key={i} className="text-lg">
//                       {i < Math.round(volunteer.rating || 0) ? '⭐' : '☆'}
//                     </span>
//                   ))}
//                   <span className="text-xs text-gray-600 ml-1">
//                     {volunteer.rating?.toFixed(1)} · {volunteer.totalReviews} reviews
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Rating Section */}
//         <div className="card">
//           <p className="text-sm font-bold text-gray-900 mb-4">How would you rate your experience?</p>
//           <div className="flex justify-center gap-3">
//             {[1, 2, 3, 4, 5].map((star) => (
//               <button
//                 key={star}
//                 onClick={() => setRating(star)}
//                 className="transition-transform duration-200 hover:scale-110 active:scale-95"
//               >
//                 <span
//                   className={`text-5xl ${
//                     star <= rating ? 'text-amber-400 drop-shadow-md' : 'text-gray-300'
//                   } cursor-pointer select-none`}
//                 >
//                   {star <= rating ? '⭐' : '☆'}
//                 </span>
//               </button>
//             ))}
//           </div>
//           <p className="text-center text-sm font-semibold text-gray-700 mt-4">
//             {rating === 1
//               ? 'Poor'
//               : rating === 2
//               ? 'Fair'
//               : rating === 3
//               ? 'Good'
//               : rating === 4
//               ? 'Very Good'
//               : 'Excellent'}
//           </p>
//         </div>

//         {/* Review Text */}
//         <div className="card">
//           <label className="text-sm font-bold text-gray-900">Share your feedback (optional)</label>
//           <textarea
//             value={review}
//             onChange={(e) => setReview(e.target.value)}
//             maxLength={300}
//             placeholder="Tell us about your experience with the volunteer... What went well? Any suggestions?"
//             className="w-full mt-3 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
//             rows={4}
//           />
//           <div className="flex items-center justify-between mt-2">
//             <span className="text-xs text-gray-400">{review.length}/300</span>
//             {review && (
//               <button
//                 onClick={() => setReview('')}
//                 className="text-xs text-gray-400 hover:text-gray-600"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Helpful prompts */}
//         <div className="space-y-2">
//           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">💡 You can mention:</p>
//           <div className="space-y-2">
//             {[
//               'Response time and professionalism',
//               'How well they communicated',
//               'Whether they made you feel safe',
//               'Any improvements they could make',
//             ].map((prompt) => (
//               <button
//                 key={prompt}
//                 onClick={() => setReview((prev) => (prev ? prev + ' ' + prompt : prompt))}
//                 className="w-full text-left px-3 py-2 text-xs text-gray-600 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition"
//               >
//                 {prompt}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Anonymous note */}
//         <div className="card bg-blue-50 border-blue-100">
//           <p className="text-xs text-blue-700 font-medium">
//             🔒 Your review will be shared with the volunteer but your contact details remain private.
//           </p>
//         </div>

//         {/* Submit Button */}
//         <button
//           onClick={handleSubmitReview}
//           disabled={submitting || rating === 0}
//           className="btn-safe w-full flex items-center justify-center gap-2 text-base disabled:opacity-50"
//         >
//           {submitting ? (
//             <>
//               <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
//               Submitting...
//             </>
//           ) : (
//             '⭐ Submit Review'
//           )}
//         </button>

//         {/* Skip option */}
//         <button
//           onClick={() => navigate('/home')}
//           className="w-full py-3 text-sm text-gray-600 font-medium hover:text-gray-800 transition"
//         >
//           Skip for now
//         </button>
//       </div>
//     </div>
//   );
// }


























import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { alertService } from '../../services/api';
import toast from 'react-hot-toast';

export default function ReviewPage() {

  const { alertId } = useParams();

  const navigate = useNavigate();

  const [alert, setAlert] = useState(null);

  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);

  const [review, setReview] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // =====================================================
  // FETCH ALERT DETAILS
  // =====================================================

  useEffect(() => {

    const fetchAlert = async () => {

      try {

        setLoading(true);

        // =================================================
        // REAL API (UNCOMMENT WHEN READY)
        // =================================================

        /*
        const { data } =
          await alertService.getAlertById(alertId);

        setAlert(data.alert);
        */

        // =================================================
        // TEMP MOCK DATA
        // =================================================

        setAlert({

          _id: alertId,

          volunteer: {

            _id: '1',

            name: 'John Doe',

            rating: 4.8,

            totalReviews: 24
          },

          status: 'resolved'
        });

      } catch (err) {

        toast.error(
          'Failed to load alert details'
        );

      } finally {

        setLoading(false);
      }
    };

    if (alertId) {
      fetchAlert();
    }

  }, [alertId]);

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const handleSubmitReview = async () => {

    if (rating === 0) {

      toast.error(
        'Please select a rating'
      );

      return;
    }

    setSubmitting(true);

    try {

      // ===============================================
      // REAL API (UNCOMMENT WHEN READY)
      // ===============================================

      /*
      await alertService.submitReview(
        alertId,
        {
          rating,
          review
        }
      );
      */

      // MOCK DELAY

      await new Promise(resolve =>
        setTimeout(resolve, 1500)
      );

      toast.success(
        'Thank you for your feedback!'
      );

      navigate('/home');

    } catch (err) {

      toast.error(
        err.message ||
        'Failed to submit review'
      );

    } finally {

      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING UI
  // =====================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-gray-50 pb-24 px-5 pt-12">

        <div className="space-y-4">

          {[...Array(3)].map((_, i) => (

            <div
              key={i}
              className="card h-20 animate-pulse bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  const volunteer = alert?.volunteer;

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-gray-50">

      {/* HEADER */}

      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">

        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-600 mb-3"
        >
          ← Back
        </button>

        <h1 className="text-xl font-bold text-gray-900">
          Rate Your Experience
        </h1>

        <p className="text-xs text-gray-500 mt-0.5">
          Help us improve our service
        </p>
      </div>

      <div className="px-5 pt-8 pb-12 space-y-6">

        {/* VOLUNTEER CARD */}

        {volunteer && (

          <div className="card border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">

            <div className="flex items-center gap-4">

              <div className="
                w-14 h-14 rounded-full
                bg-gradient-to-br
                from-blue-200 to-blue-300
                flex items-center justify-center
                text-3xl flex-shrink-0
                border-2 border-amber-200
              ">
                🙋
              </div>

              <div className="flex-1 min-w-0">

                <p className="text-sm font-bold text-gray-900">
                  {volunteer.name}
                </p>

                <div className="flex items-center gap-1 mt-1">

                  {[...Array(5)].map((_, i) => (

                    <span
                      key={i}
                      className="text-lg"
                    >
                      {
                        i < Math.round(
                          volunteer.rating || 0
                        )
                          ? '⭐'
                          : '☆'
                      }
                    </span>
                  ))}

                  <span className="text-xs text-gray-600 ml-1">

                    {volunteer.rating?.toFixed(1)}
                    {' · '}
                    {volunteer.totalReviews}
                    {' '}
                    reviews
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RATING */}

        <div className="card">

          <p className="text-sm font-bold text-gray-900 mb-4">
            How would you rate your experience?
          </p>

          <div className="flex justify-center gap-3">

            {[1, 2, 3, 4, 5].map((star) => (

              <button
                key={star}
                onClick={() => setRating(star)}
                className="
                  transition-transform duration-200
                  hover:scale-110
                  active:scale-95
                "
              >
                <span
                  className={`
                    text-5xl cursor-pointer select-none
                    ${
                      star <= rating
                        ? 'text-amber-400 drop-shadow-md'
                        : 'text-gray-300'
                    }
                  `}
                >
                  {
                    star <= rating
                      ? '⭐'
                      : '☆'
                  }
                </span>
              </button>
            ))}
          </div>

          <p className="text-center text-sm font-semibold text-gray-700 mt-4">

            {
              rating === 1
                ? 'Poor'
                : rating === 2
                ? 'Fair'
                : rating === 3
                ? 'Good'
                : rating === 4
                ? 'Very Good'
                : 'Excellent'
            }
          </p>
        </div>

        {/* REVIEW */}

        <div className="card">

          <label className="text-sm font-bold text-gray-900">
            Share your feedback (optional)
          </label>

          <textarea
            value={review}
            onChange={(e) =>
              setReview(e.target.value)
            }
            maxLength={300}
            placeholder="
Tell us about your experience with the volunteer...
What went well? Any suggestions?
            "
            className="
              w-full mt-3 px-3 py-2
              border border-gray-200
              rounded-lg text-sm text-gray-800
              placeholder-gray-400
              focus:outline-none
              focus:ring-2
              focus:ring-primary/50
              resize-none
            "
            rows={4}
          />

          <div className="flex items-center justify-between mt-2">

            <span className="text-xs text-gray-400">
              {review.length}/300
            </span>

            {review && (

              <button
                onClick={() => setReview('')}
                className="
                  text-xs text-gray-400
                  hover:text-gray-600
                "
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* PROMPTS */}

        <div className="space-y-2">

          <p className="
            text-xs font-semibold text-gray-500
            uppercase tracking-wide px-1
          ">
            💡 You can mention:
          </p>

          <div className="space-y-2">

            {[
              'Response time and professionalism',
              'How well they communicated',
              'Whether they made you feel safe',
              'Any improvements they could make'
            ].map((prompt) => (

              <button
                key={prompt}
                onClick={() =>
                  setReview(prev =>
                    prev
                      ? prev + ' ' + prompt
                      : prompt
                  )
                }
                className="
                  w-full text-left
                  px-3 py-2 text-xs
                  text-gray-600 bg-white
                  border border-gray-100
                  rounded-lg hover:bg-gray-50
                  transition
                "
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* NOTE */}

        <div className="card bg-blue-50 border-blue-100">

          <p className="text-xs text-blue-700 font-medium">
            🔒 Your review will be shared with the volunteer
            but your contact details remain private.
          </p>
        </div>

        {/* SUBMIT */}

        <button
          onClick={handleSubmitReview}
          disabled={submitting || rating === 0}
          className="
            btn-safe w-full
            flex items-center justify-center gap-2
            text-base disabled:opacity-50
          "
        >

          {submitting ? (

            <>
              <span className="
                w-5 h-5
                border-2 border-white/40
                border-t-white
                rounded-full animate-spin
              " />

              Submitting...
            </>

          ) : (

            '⭐ Submit Review'
          )}
        </button>

        {/* SKIP */}

        <button
          onClick={() => navigate('/home')}
          className="
            w-full py-3 text-sm
            text-gray-600 font-medium
            hover:text-gray-800
            transition
          "
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}