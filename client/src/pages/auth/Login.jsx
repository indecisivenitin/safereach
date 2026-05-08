// import { useState } from 'react';
// import { Link, Navigate, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { useAuth } from '../../context/AuthContext';

// const Login = () => {
//     const navigate = useNavigate();
//     const { login, user, loading } = useAuth();

//     const [formData, setFormData] = useState({
//         email: '',
//         password: '',
//     });
//     const [submitting, setSubmitting] = useState(false);

//     if (!loading && user) {
//         return <Navigate to={user.role === 'volunteer' ? '/volunteer/home' : '/home'} replace />;
//     }

//     const handleChange = (event) => {
//         const { name, value } = event.target;

//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     const validateForm = () => {
//         if (!formData.email.trim()) {
//             toast.error('Email is required');
//             return false;
//         }

//         if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
//             toast.error('Please enter a valid email');
//             return false;
//         }

//         if (!formData.password) {
//             toast.error('Password is required');
//             return false;
//         }

//         return true;
//     };

//     const handleSubmit = async (event) => {
//         event.preventDefault();

//         if (!validateForm()) return;

//         try {
//             setSubmitting(true);

//             const loggedInUser = await login(
//                 formData.email.trim().toLowerCase(),
//                 formData.password
//             );

//             toast.success('Login successful');

//             navigate(loggedInUser.role === 'volunteer' ? '/volunteer/home' : '/home', {
//                 replace: true,
//             });
//         } catch (error) {
//             toast.error(error?.message || 'Login failed. Please check your credentials.');
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     return (
//         <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 px-4 py-8">
//             <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
//                 <div className="mb-8 text-center">
//                     <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-3xl text-white shadow-lg shadow-primary/30">
//                         🛡️
//                     </div>
//                     <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
//                     <p className="mt-2 text-sm text-gray-500">
//                         Login to continue using SafeReach
//                     </p>
//                 </div>

//                 <form onSubmit={handleSubmit} className="card space-y-5">
//                     <div>
//                         <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
//                             Email Address
//                         </label>
//                         <input
//                             id="email"
//                             name="email"
//                             type="email"
//                             autoComplete="email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             placeholder="you@example.com"
//                             className="input-field"
//                             disabled={submitting}
//                         />
//                     </div>

//                     <div>
//                         <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
//                             Password
//                         </label>
//                         <input
//                             id="password"
//                             name="password"
//                             type="password"
//                             autoComplete="current-password"
//                             value={formData.password}
//                             onChange={handleChange}
//                             placeholder="Enter your password"
//                             className="input-field"
//                             disabled={submitting}
//                         />
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={submitting}
//                         className="btn-primary w-full"
//                     >
//                         {submitting ? 'Logging in...' : 'Login'}
//                     </button>

//                     <p className="text-center text-sm text-gray-500">
//                         Don&apos;t have an account?{' '}
//                         <Link to="/register" className="font-semibold text-primary">
//                             Create one
//                         </Link>
//                     </p>
//                 </form>
//             </section>
//         </main>
//     );
// };

// export default Login;








import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'volunteer' ? '/volunteer/home' : '/home', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-3xl shadow-lg shadow-primary/25 mb-4">
          🛡️
        </div>
        <h1 className="text-2xl font-bold text-gray-900">SafeReach</h1>
        <p className="text-sm text-gray-500 mt-1">Safety at your fingertips</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 max-w-md mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Email address</label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick test fill */}
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs font-medium text-amber-700 mb-2">🧪 Demo accounts</p>
            <div className="flex gap-2">
              <button
                onClick={() => setForm({ email: 'priya@test.com', password: 'Test@1234' })}
                className="text-xs bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg font-medium"
              >
                👩 Woman
              </button>
              <button
                onClick={() => setForm({ email: 'rahul@test.com', password: 'Test@1234' })}
                className="text-xs bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg font-medium"
              >
                🤝 Volunteer
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold">
            Register
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-gray-400 py-6">
        SafeReach · Built for safety, powered by community
      </p>
    </div>
  );
}