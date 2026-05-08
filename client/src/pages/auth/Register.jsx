
// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// import { useAuth } from '../../context/AuthContext';

// import toast from 'react-hot-toast';

// import WebcamCapture from '../../components/auth/WebcamCapture';

// const ROLES = [
//   {
//     value: 'woman',
//     emoji: '👩',
//     label: 'I need safety support',
//     desc: 'Send SOS alerts to nearby volunteers',
//   },

//   {
//     value: 'volunteer',
//     emoji: '🤝',
//     label: 'I want to help',
//     desc: 'Respond to nearby SOS alerts',
//   },
// ];

// export default function Register() {

//   const { register } = useAuth();

//   const navigate = useNavigate();

//   const [step, setStep] = useState(1);

//   const [loading, setLoading] =
//     useState(false);

//   // =========================
//   // Selfie State
//   // =========================
//   const [selfie, setSelfie] =
//     useState(null);

//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     password: '',
//     role: '',
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
//   // Step Validation
//   // =========================
//   const nextStep = () => {

//     if (!form.name.trim()) {
//       return toast.error(
//         'Please enter your name'
//       );
//     }

//     if (
//       !form.email ||
//       !/^\S+@\S+\.\S+$/.test(
//         form.email
//       )
//     ) {
//       return toast.error(
//         'Enter a valid email'
//       );
//     }

//     if (
//       !/^[6-9]\d{9}$/.test(
//         form.phone
//       )
//     ) {
//       return toast.error(
//         'Enter a valid 10-digit mobile number'
//       );
//     }

//     setStep(2);
//   };

//   // =========================
//   // Register
//   // =========================
//   const handleSubmit = async (e) => {

//     e.preventDefault();

//     if (!form.role) {
//       return toast.error(
//         'Please select your role'
//       );
//     }

//     if (
//       form.password.length < 8
//     ) {
//       return toast.error(
//         'Password must be at least 8 characters'
//       );
//     }

//     if (
//       !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(
//         form.password
//       )
//     ) {
//       return toast.error(
//         'Password needs uppercase, lowercase & number'
//       );
//     }

//     // =========================
//     // Selfie required for women
//     // =========================
//     if (
//       form.role === 'woman' &&
//       !selfie
//     ) {
//       return toast.error(
//         'Please capture your selfie'
//       );
//     }

//     setLoading(true);

//     try {

//       // =========================
//       // Build multipart FormData
//       // =========================
//       const payload =
//         new FormData();

//       payload.append(
//         'name',
//         form.name.trim()
//       );

//       payload.append(
//         'email',
//         form.email
//           .trim()
//           .toLowerCase()
//       );

//       payload.append(
//         'phone',
//         form.phone.trim()
//       );

//       payload.append(
//         'password',
//         form.password
//       );

//       payload.append(
//         'role',
//         form.role
//       );

//       // Selfie image
//       if (selfie) {
//         payload.append(
//           'selfie',
//           selfie
//         );
//       }

//       // API Call
//       const user =
//         await register(payload);

//       toast.success(
//         `Welcome to SafeReach, ${
//           user.name.split(' ')[0]
//         }! 🛡️`
//       );

//       navigate(
//         user.role === 'volunteer'
//           ? '/volunteer/home'
//           : '/home',
//         {
//           replace: true,
//         }
//       );

//     } catch (err) {

//       toast.error(
//         err.message ||
//         'Registration failed'
//       );

//     } finally {

//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex flex-col">

//       {/* Header */}
//       <div className="flex flex-col items-center pt-12 pb-6 px-6">

//         <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-2xl shadow-lg shadow-primary/25 mb-3">
//           🛡️
//         </div>

//         <h1 className="text-xl font-bold text-gray-900">
//           Create Account
//         </h1>

//         {/* Step indicator */}
//         <div className="flex items-center gap-2 mt-4">

//           <div
//             className={`w-8 h-1.5 rounded-full ${
//               step >= 1
//                 ? 'bg-primary'
//                 : 'bg-gray-200'
//             }`}
//           />

//           <div
//             className={`w-8 h-1.5 rounded-full ${
//               step >= 2
//                 ? 'bg-primary'
//                 : 'bg-gray-200'
//             }`}
//           />

//         </div>
//       </div>

//       {/* Card */}
//       <div className="flex-1 px-6 max-w-md mx-auto w-full">

//         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

//           {/* ========================= */}
//           {/* Step 1 */}
//           {/* ========================= */}
//           {step === 1 && (

//             <div className="space-y-4">

//               <h2 className="text-base font-semibold text-gray-900">
//                 Your details
//               </h2>

//               {/* Name */}
//               <div>

//                 <label className="text-xs font-medium text-gray-600 mb-1.5 block">
//                   Full name
//                 </label>

//                 <input
//                   name="name"
//                   value={form.name}
//                   onChange={handleChange}
//                   placeholder="Priya Sharma"
//                   className="input-field"
//                 />

//               </div>

//               {/* Email */}
//               <div>

//                 <label className="text-xs font-medium text-gray-600 mb-1.5 block">
//                   Email address
//                 </label>

//                 <input
//                   name="email"
//                   type="email"
//                   value={form.email}
//                   onChange={handleChange}
//                   placeholder="you@example.com"
//                   className="input-field"
//                 />

//               </div>

//               {/* Phone */}
//               <div>

//                 <label className="text-xs font-medium text-gray-600 mb-1.5 block">
//                   Mobile number
//                 </label>

//                 <div className="flex gap-2">

//                   <span className="input-field w-14 text-center text-gray-500 flex-shrink-0">
//                     +91
//                   </span>

//                   <input
//                     name="phone"
//                     type="tel"
//                     value={form.phone}
//                     onChange={handleChange}
//                     placeholder="9876543210"
//                     maxLength={10}
//                     className="input-field flex-1"
//                   />

//                 </div>
//               </div>

//               {/* Continue */}
//               <button
//                 onClick={nextStep}
//                 className="btn-primary w-full mt-2"
//               >
//                 Continue →
//               </button>

//             </div>
//           )}

//           {/* ========================= */}
//           {/* Step 2 */}
//           {/* ========================= */}
//           {step === 2 && (

//             <form
//               onSubmit={handleSubmit}
//               className="space-y-4"
//             >

//               <h2 className="text-base font-semibold text-gray-900">
//                 Choose your role
//               </h2>

//               {/* Role Selection */}
//               <div className="grid gap-3">

//                 {ROLES.map(
//                   ({
//                     value,
//                     emoji,
//                     label,
//                     desc,
//                   }) => (

//                     <button
//                       key={value}

//                       type="button"

//                       onClick={() =>
//                         setForm((prev) => ({
//                           ...prev,
//                           role: value,
//                         }))
//                       }

//                       className={`p-4 rounded-2xl border-2 text-left transition-all ${
//                         form.role === value
//                           ? 'border-primary bg-red-50'
//                           : 'border-gray-200 bg-white hover:border-gray-300'
//                       }`}
//                     >

//                       <div className="flex items-center gap-3">

//                         <span className="text-2xl">
//                           {emoji}
//                         </span>

//                         <div>

//                           <p className="text-sm font-semibold text-gray-900">
//                             {label}
//                           </p>

//                           <p className="text-xs text-gray-500 mt-0.5">
//                             {desc}
//                           </p>

//                         </div>

//                         <div
//                           className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                             form.role === value
//                               ? 'border-primary bg-primary'
//                               : 'border-gray-300'
//                           }`}
//                         >

//                           {form.role === value && (
//                             <div className="w-2 h-2 rounded-full bg-white" />
//                           )}

//                         </div>

//                       </div>
//                     </button>
//                   )
//                 )}
//               </div>

//               {/* ========================= */}
//               {/* Webcam Section */}
//               {/* ========================= */}
//               {form.role === 'woman' && (

//                 <div className="space-y-3">

//                   <div>

//                     <label className="text-xs font-medium text-gray-600 mb-2 block">
//                       Woman Verification Selfie
//                     </label>

//                     <p className="text-xs text-gray-500 mb-3">
//                       Capture a live selfie for AI verification
//                     </p>

//                   </div>

//                   <WebcamCapture
//                     onCapture={setSelfie}
//                   />

//                 </div>
//               )}

//               {/* Password */}
//               <div>

//                 <label className="text-xs font-medium text-gray-600 mb-1.5 block">
//                   Password
//                 </label>

//                 <input
//                   name="password"
//                   type="password"
//                   value={form.password}
//                   onChange={handleChange}
//                   placeholder="Min 8 chars, uppercase & number"
//                   className="input-field"
//                 />

//               </div>

//               {/* Buttons */}
//               <div className="flex gap-3">

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setStep(1)
//                   }
//                   className="btn-outline flex-1"
//                 >
//                   ← Back
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="btn-primary flex-1 flex items-center justify-center"
//                 >

//                   {loading ? (

//                     <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />

//                   ) : (
//                     'Register'
//                   )}

//                 </button>
//               </div>

//             </form>
//           )}
//         </div>

//         {/* Login */}
//         <p className="text-center text-sm text-gray-500 mt-6">

//           Already have an account?{' '}

//           <Link
//             to="/login"
//             className="text-primary font-semibold"
//           >
//             Sign in
//           </Link>

//         </p>
//       </div>
//     </div>
//   );
// }



















import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import toast from 'react-hot-toast';

import WebcamCapture from '../../components/auth/WebcamCapture';

const ROLES = [
  {
    value: 'woman',
    emoji: '👩',
    label: 'I need safety support',
    desc: 'Send SOS alerts to nearby volunteers',
  },

  {
    value: 'volunteer',
    emoji: '🤝',
    label: 'I want to help',
    desc: 'Respond to nearby SOS alerts',
  },
];

export default function Register() {
  const { register } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [loading, setLoading] =
    useState(false);

  // =========================
  // Selfie State
  // =========================
  const [selfie, setSelfie] =
    useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    aadhaarNumber: '',
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
  // Step Validation
  // =========================
  const nextStep = () => {
    if (!form.name.trim()) {
      return toast.error(
        'Please enter your name'
      );
    }

    if (
      !form.email ||
      !/^\S+@\S+\.\S+$/.test(
        form.email
      )
    ) {
      return toast.error(
        'Enter a valid email'
      );
    }

    if (
      !/^[6-9]\d{9}$/.test(
        form.phone
      )
    ) {
      return toast.error(
        'Enter a valid 10-digit mobile number'
      );
    }

    setStep(2);
  };

  // =========================
  // Register
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.role) {
      return toast.error(
        'Please select your role'
      );
    }

    if (
      form.password.length < 8
    ) {
      return toast.error(
        'Password must be at least 8 characters'
      );
    }

    if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(
        form.password
      )
    ) {
      return toast.error(
        'Password needs uppercase, lowercase & number'
      );
    }

    // =========================
    // Aadhaar validation
    // =========================
    if (
      form.role ===
      'volunteer'
    ) {
      if (
        !form.aadhaarNumber
      ) {
        return toast.error(
          'Please enter your Aadhaar number'
        );
      }

      if (
        !/^[2-9]\d{11}$/.test(
          form.aadhaarNumber
        )
      ) {
        return toast.error(
          'Enter a valid 12-digit Aadhaar number'
        );
      }
    }

    // =========================
    // Selfie required for women
    // =========================
    if (
      form.role === 'woman' &&
      !selfie
    ) {
      return toast.error(
        'Please capture your selfie'
      );
    }

    setLoading(true);

    try {
      // =========================
      // Build multipart FormData
      // =========================
      const payload =
        new FormData();

      payload.append(
        'name',
        form.name.trim()
      );

      payload.append(
        'email',
        form.email
          .trim()
          .toLowerCase()
      );

      payload.append(
        'phone',
        form.phone.trim()
      );

      payload.append(
        'password',
        form.password
      );

      payload.append(
        'role',
        form.role
      );

      // Aadhaar
      if (
        form.role ===
        'volunteer'
      ) {
        payload.append(
          'aadhaarNumber',
          form.aadhaarNumber.trim()
        );
      }

      // Selfie image
      if (selfie) {
        payload.append(
          'selfie',
          selfie
        );
      }

      // API Call
      const user =
        await register(payload);

      toast.success(
        `Welcome to SafeReach, ${
          user.name.split(' ')[0]
        }! 🛡️`
      );

      navigate(
        user.role ===
          'volunteer'
          ? '/volunteer/home'
          : '/home',
        {
          replace: true,
        }
      );
    } catch (err) {
      toast.error(
        err.message ||
          'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center pt-12 pb-6 px-6">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-2xl shadow-lg shadow-primary/25 mb-3">
          🛡️
        </div>

        <h1 className="text-xl font-bold text-gray-900">
          Create Account
        </h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-4">
          <div
            className={`w-8 h-1.5 rounded-full ${
              step >= 1
                ? 'bg-primary'
                : 'bg-gray-200'
            }`}
          />

          <div
            className={`w-8 h-1.5 rounded-full ${
              step >= 2
                ? 'bg-primary'
                : 'bg-gray-200'
            }`}
          />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 px-6 max-w-md mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          {/* ========================= */}
          {/* Step 1 */}
          {/* ========================= */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900">
                Your details
              </h2>

              {/* Name */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Full name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Priya Sharma"
                  className="input-field"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Email address
                </label>

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Mobile number
                </label>

                <div className="flex gap-2">
                  <span className="input-field w-14 text-center text-gray-500 flex-shrink-0">
                    +91
                  </span>

                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    maxLength={10}
                    className="input-field flex-1"
                  />
                </div>
              </div>

              {/* Continue */}
              <button
                onClick={nextStep}
                className="btn-primary w-full mt-2"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ========================= */}
          {/* Step 2 */}
          {/* ========================= */}
          {step === 2 && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <h2 className="text-base font-semibold text-gray-900">
                Choose your role
              </h2>

              {/* Role Selection */}
              <div className="grid gap-3">
                {ROLES.map(
                  ({
                    value,
                    emoji,
                    label,
                    desc,
                  }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          role: value,
                        }))
                      }
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        form.role === value
                          ? 'border-primary bg-red-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {emoji}
                        </span>

                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {label}
                          </p>

                          <p className="text-xs text-gray-500 mt-0.5">
                            {desc}
                          </p>
                        </div>

                        <div
                          className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            form.role === value
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          }`}
                        >
                          {form.role ===
                            value && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>

              {/* ========================= */}
              {/* Aadhaar Section */}
              {/* ========================= */}
              {form.role ===
                'volunteer' && (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                      Aadhaar Number
                    </label>

                    <p className="text-xs text-gray-500 mb-3">
                      Used for volunteer verification and safety
                    </p>
                  </div>

                  <input
                    name="aadhaarNumber"
                    type="text"
                    value={
                      form.aadhaarNumber
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="123412341234"
                    maxLength={12}
                    className="input-field"
                  />
                </div>
              )}

              {/* ========================= */}
              {/* Webcam Section */}
              {/* ========================= */}
              {form.role === 'woman' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">
                      Woman Verification Selfie
                    </label>

                    <p className="text-xs text-gray-500 mb-3">
                      Capture a live selfie for AI verification
                    </p>
                  </div>

                  <WebcamCapture
                    onCapture={setSelfie}
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Password
                </label>

                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 8 chars, uppercase & number"
                  className="input-field"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setStep(1)
                  }
                  className="btn-outline flex-1"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Register'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}

          <Link
            to="/login"
            className="text-primary font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}