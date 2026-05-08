

// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// import { useAuth } from '../../context/AuthContext';

// import { authService } from '../../services/api';

// import { VolunteerNav } from '../../components/BottomNav';

// import toast from 'react-hot-toast';

// export default function VolunteerProfile() {

//   const navigate = useNavigate();

//   const {
//     user,
//     logout,
//     updateUser,
//   } = useAuth();

//   const [loading, setLoading] =
//     useState(false);

//   const [editing, setEditing] =
//     useState(false);

//   const [form, setForm] = useState({
//     volunteerBio:
//       user?.volunteerBio || '',

//     availabilityNote:
//       user?.availabilityNote || '',

//     skills:
//       user?.skills?.join(', ') || '',

//     languages:
//       user?.languages?.join(', ') || '',
//   });

//   // =========================
//   // Input Change
//   // =========================
//   const handleChange = (e) => {

//     setForm((prev) => ({
//       ...prev,
//       [e.target.name]:
//         e.target.value,
//     }));
//   };

//   // =========================
//   // Save Profile
//   // =========================
//   const handleSave =
//     async () => {

//       try {

//         setLoading(true);

//         const payload = {
//           volunteerBio:
//             form.volunteerBio,

//           availabilityNote:
//             form.availabilityNote,

//           skills:
//             form.skills
//               .split(',')
//               .map((s) =>
//                 s.trim()
//               )
//               .filter(Boolean),

//           languages:
//             form.languages
//               .split(',')
//               .map((s) =>
//                 s.trim()
//               )
//               .filter(Boolean),
//         };

//         const { data } =
//           await authService.updateProfile(
//             payload
//           );

//         updateUser(data.user);

//         toast.success(
//           'Profile updated'
//         );

//         setEditing(false);

//       } catch (err) {

//         toast.error(
//           err.message ||
//           'Failed to update profile'
//         );

//       } finally {

//         setLoading(false);
//       }
//     };

//   // =========================
//   // Logout
//   // =========================
//   const handleLogout = () => {

//     logout();

//     toast.success(
//       'Logged out successfully'
//     );

//     navigate('/login');
//   };

//   const maskedAadhaar =
//     user?.aadhaarNumber
//       ? `XXXX-XXXX-${user.aadhaarNumber.slice(-4)}`
//       : 'Not Available';

//   return (
//     <div className="min-h-screen bg-gray-50 pb-24">

//       {/* Hero */}
//       <div className="bg-gradient-to-br from-primary to-red-500 px-5 pt-14 pb-8 text-white rounded-b-[2rem] shadow-lg">

//         <div className="flex items-center gap-4">

//           <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl border border-white/20">
//             🙋
//           </div>

//           <div className="flex-1 min-w-0">

//             <h1 className="text-2xl font-bold truncate">
//               {user?.name}
//             </h1>

//             <p className="text-sm text-white/80 mt-1 truncate">
//               {user?.email}
//             </p>

//             <div className="flex flex-wrap gap-2 mt-3">

//               <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
//                 🤝 Volunteer
//               </span>

//               <span className="bg-green-500/20 border border-green-300/30 text-white text-xs px-3 py-1 rounded-full font-medium">
//                 ✅ Aadhaar Verified
//               </span>

//             </div>

//           </div>

//         </div>
//       </div>

//       <div className="px-5 pt-6 space-y-5">

//         {/* Stats */}
//         <div className="grid grid-cols-2 gap-3">

//           <div className="card text-center">

//             <p className="text-2xl font-bold text-primary">
//               {user?.totalAlertsHelped || 0}
//             </p>

//             <p className="text-xs text-gray-500 mt-1">
//               Alerts Helped
//             </p>

//           </div>

//           <div className="card text-center">

//             <p className="text-2xl font-bold text-amber-500">
//               {user?.averageRating
//                 ? user.averageRating.toFixed(1)
//                 : '—'}
//             </p>

//             <p className="text-xs text-gray-500 mt-1">
//               Volunteer Rating
//             </p>

//           </div>

//         </div>

//         {/* Personal Info */}
//         <div className="card space-y-4">

//           <div className="flex items-center justify-between">

//             <h2 className="text-sm font-bold text-gray-900">
//               Personal Information
//             </h2>

//             <button
//               onClick={() =>
//                 setEditing(
//                   !editing
//                 )
//               }
//               className="text-xs font-semibold text-primary"
//             >
//               {editing
//                 ? 'Cancel'
//                 : 'Edit'}
//             </button>

//           </div>

//           {/* Phone */}
//           <div>

//             <p className="text-xs text-gray-500 mb-1">
//               Phone Number
//             </p>

//             <p className="text-sm font-medium text-gray-900">
//               +91 {user?.phone}
//             </p>

//           </div>

//           {/* Aadhaar */}
//           <div>

//             <p className="text-xs text-gray-500 mb-1">
//               Aadhaar Number
//             </p>

//             <p className="text-sm font-medium text-gray-900">
//               {maskedAadhaar}
//             </p>

//           </div>

//           {/* Bio */}
//           <div>

//             <p className="text-xs text-gray-500 mb-1">
//               About Volunteer
//             </p>

//             {editing ? (

//               <textarea
//                 name="volunteerBio"
//                 value={
//                   form.volunteerBio
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 rows={4}
//                 placeholder="Tell users about yourself..."
//                 className="input-field resize-none"
//               />

//             ) : (

//               <p className="text-sm text-gray-700 leading-relaxed">
//                 {user?.volunteerBio ||
//                   'No bio added yet.'}
//               </p>
//             )}

//           </div>

//           {/* Skills */}
//           <div>

//             <p className="text-xs text-gray-500 mb-2">
//               Skills
//             </p>

//             {editing ? (

//               <input
//                 type="text"
//                 name="skills"
//                 value={form.skills}
//                 onChange={
//                   handleChange
//                 }
//                 placeholder="First Aid, Self Defence, Driving"
//                 className="input-field"
//               />

//             ) : (

//               <div className="flex flex-wrap gap-2">

//                 {user?.skills?.length > 0 ? (
//                   user.skills.map(
//                     (
//                       skill,
//                       index
//                     ) => (
//                       <span
//                         key={index}
//                         className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium"
//                       >
//                         {skill}
//                       </span>
//                     )
//                   )
//                 ) : (
//                   <p className="text-sm text-gray-500">
//                     No skills added
//                   </p>
//                 )}

//               </div>
//             )}

//           </div>

//           {/* Languages */}
//           <div>

//             <p className="text-xs text-gray-500 mb-2">
//               Languages
//             </p>

//             {editing ? (

//               <input
//                 type="text"
//                 name="languages"
//                 value={
//                   form.languages
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 placeholder="Hindi, English"
//                 className="input-field"
//               />

//             ) : (

//               <div className="flex flex-wrap gap-2">

//                 {user?.languages?.length > 0 ? (

//                   user.languages.map(
//                     (
//                       lang,
//                       index
//                     ) => (
//                       <span
//                         key={index}
//                         className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium"
//                       >
//                         {lang}
//                       </span>
//                     )
//                   )

//                 ) : (

//                   <p className="text-sm text-gray-500">
//                     No languages added
//                   </p>
//                 )}

//               </div>
//             )}

//           </div>

//           {/* Availability */}
//           <div>

//             <p className="text-xs text-gray-500 mb-1">
//               Availability Note
//             </p>

//             {editing ? (

//               <textarea
//                 name="availabilityNote"
//                 value={
//                   form.availabilityNote
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 rows={3}
//                 placeholder="Available mostly at night..."
//                 className="input-field resize-none"
//               />

//             ) : (

//               <p className="text-sm text-gray-700">
//                 {user?.availabilityNote ||
//                   'No availability note added.'}
//               </p>
//             )}

//           </div>

//           {/* Save */}
//           {editing && (

//             <button
//               onClick={
//                 handleSave
//               }
//               disabled={
//                 loading
//               }
//               className="btn-primary w-full"
//             >

//               {loading
//                 ? 'Saving...'
//                 : 'Save Changes'}

//             </button>
//           )}

//         </div>

//         {/* Logout */}
//         <button
//           onClick={
//             handleLogout
//           }
//           className="w-full bg-red-500 hover:bg-red-600 transition-colors text-white font-semibold py-4 rounded-2xl shadow-sm"
//         >
//           Logout
//         </button>

//       </div>

//       <VolunteerNav />
//     </div>
//   );
// }


































import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import { authService } from '../../services/api';

import { VolunteerNav } from '../../components/BottomNav';

import toast from 'react-hot-toast';

export default function VolunteerProfile() {

  const navigate = useNavigate();

  const {
    user,
    logout,
    updateUser,
  } = useAuth();

  const [loading, setLoading] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [form, setForm] = useState({
    bio:
      user?.bio || '',

    city:
      user?.city || '',

    occupation:
      user?.occupation || '',

    languages:
      user?.languages?.join(', ') || '',
  });

  // =========================
  // Input Change
  // =========================
  const handleChange = (e) => {

    setForm((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  // =========================
  // Save Profile
  // =========================
  const handleSave =
    async () => {

      try {

        setLoading(true);

        const payload = {
          bio:
            form.bio,

          city:
            form.city,

          occupation:
            form.occupation,

          languages:
            form.languages,
        };

        const { data } =
          await authService.updateProfile(
            payload
          );

        updateUser(data.user);

        toast.success(
          'Profile updated successfully'
        );

        setEditing(false);

      } catch (err) {

        toast.error(
          err.message ||
          'Failed to update profile'
        );

      } finally {

        setLoading(false);
      }
    };

  // =========================
  // Logout
  // =========================
  const handleLogout = () => {

    logout();

    toast.success(
      'Logged out successfully'
    );

    navigate('/login');
  };

  const maskedAadhaar =
    user?.aadhaarNumber
      ? `XXXX-XXXX-${user.aadhaarNumber.slice(-4)}`
      : user?.aadhaarLast4
      ? `XXXX-XXXX-${user.aadhaarLast4}`
      : 'Not Available';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-red-500 px-5 pt-14 pb-8 text-white rounded-b-[2rem] shadow-lg">

        <div className="flex items-center gap-4">

          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl border border-white/20">
            🙋
          </div>

          <div className="flex-1 min-w-0">

            <h1 className="text-2xl font-bold truncate">
              {user?.name}
            </h1>

            <p className="text-sm text-white/80 mt-1 truncate">
              {user?.email}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">

              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                🤝 Volunteer
              </span>

              {user?.aadhaarVerified && (
                <span className="bg-green-500/20 border border-green-300/30 text-white text-xs px-3 py-1 rounded-full font-medium">
                  ✅ Aadhaar Verified
                </span>
              )}

            </div>

          </div>

        </div>
      </div>

      <div className="px-5 pt-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">

          <div className="card text-center">

            <p className="text-2xl font-bold text-primary">
              {user?.totalAlertsHelped || 0}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Alerts Helped
            </p>

          </div>

          <div className="card text-center">

            <p className="text-2xl font-bold text-amber-500">
              {user?.averageRating
                ? user.averageRating.toFixed(1)
                : '—'}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Volunteer Rating
            </p>

          </div>

        </div>

        {/* Personal Info */}
        <div className="card space-y-5">

          <div className="flex items-center justify-between">

            <h2 className="text-sm font-bold text-gray-900">
              Volunteer Profile
            </h2>

            <button
              onClick={() =>
                setEditing(
                  !editing
                )
              }
              className="text-xs font-semibold text-primary"
            >
              {editing
                ? 'Cancel'
                : 'Edit'}
            </button>

          </div>

          {/* Phone */}
          <div>

            <p className="text-xs text-gray-500 mb-1">
              Phone Number
            </p>

            <p className="text-sm font-medium text-gray-900">
              +91 {user?.phone}
            </p>

          </div>

          {/* Aadhaar */}
          <div>

            <p className="text-xs text-gray-500 mb-1">
              Aadhaar Number
            </p>

            <p className="text-sm font-medium text-gray-900">
              {maskedAadhaar}
            </p>

          </div>

          {/* City */}
          <div>

            <p className="text-xs text-gray-500 mb-1">
              City
            </p>

            {editing ? (

              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Delhi"
                className="input-field"
              />

            ) : (

              <p className="text-sm text-gray-700">
                {user?.city || 'Not added'}
              </p>
            )}

          </div>

          {/* Occupation */}
          <div>

            <p className="text-xs text-gray-500 mb-1">
              Occupation
            </p>

            {editing ? (

              <input
                type="text"
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                placeholder="Student, Doctor, Engineer..."
                className="input-field"
              />

            ) : (

              <p className="text-sm text-gray-700">
                {user?.occupation || 'Not added'}
              </p>
            )}

          </div>

          {/* Bio */}
          <div>

            <p className="text-xs text-gray-500 mb-1">
              About Volunteer
            </p>

            {editing ? (

              <textarea
                name="bio"
                value={
                  form.bio
                }
                onChange={
                  handleChange
                }
                rows={4}
                placeholder="Tell users about yourself..."
                className="input-field resize-none"
              />

            ) : (

              <p className="text-sm text-gray-700 leading-relaxed">
                {user?.bio ||
                  'No bio added yet.'}
              </p>
            )}

          </div>

          {/* Languages */}
          <div>

            <p className="text-xs text-gray-500 mb-2">
              Languages
            </p>

            {editing ? (

              <input
                type="text"
                name="languages"
                value={
                  form.languages
                }
                onChange={
                  handleChange
                }
                placeholder="Hindi, English"
                className="input-field"
              />

            ) : (

              <div className="flex flex-wrap gap-2">

                {user?.languages?.length > 0 ? (

                  user.languages.map(
                    (
                      lang,
                      index
                    ) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium"
                      >
                        {lang}
                      </span>
                    )
                  )

                ) : (

                  <p className="text-sm text-gray-500">
                    No languages added
                  </p>
                )}

              </div>
            )}

          </div>

          {/* Save */}
          {editing && (

            <button
              onClick={
                handleSave
              }
              disabled={
                loading
              }
              className="btn-primary w-full"
            >

              {loading
                ? 'Saving...'
                : 'Save Changes'}

            </button>
          )}

        </div>

        {/* Logout */}
        <button
          onClick={
            handleLogout
          }
          className="w-full bg-red-500 hover:bg-red-600 transition-colors text-white font-semibold py-4 rounded-2xl shadow-sm"
        >
          Logout
        </button>

      </div>

      <VolunteerNav />
    </div>
  );
}