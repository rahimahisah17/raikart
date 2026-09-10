import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const { register, loginWithGoogle, user, loading } = useAppContext();
  const navigate = useNavigate();

  if (loading) return <div className="text-center py-20 font-bold text-gray-500">Loading...</div>;
  if (user) return <Navigate to="/profile" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await register(name, email, password);
      if (success) {
        navigate('/profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setIsGoogleSubmitting(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        navigate('/profile');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-4xl" style={{ fontFamily: "'Dancing Script', cursive" }}>Raikart</h1>
        <h2 className="text-2xl font-black uppercase tracking-tighter mt-3">Become a Member</h2>
        <p className="text-slate-500 text-sm mt-2 font-medium">Create your profile and get first access to the very best of Raikart.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Full Name</label>
          <input 
            required 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full border-gray-300 rounded-xl shadow-sm p-3.5 border focus:ring-2 focus:ring-black focus:border-black font-medium text-sm" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email Address</label>
          <input 
            required 
            type="email" 
            placeholder="Email address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full border-gray-300 rounded-xl shadow-sm p-3.5 border focus:ring-2 focus:ring-black focus:border-black font-medium text-sm" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Password</label>
          <div className="relative">
            <input 
              required 
              type={showPassword ? "text" : "password"} 
              placeholder="Password (min 6 characters)" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full border-gray-300 rounded-xl shadow-sm p-3.5 pr-11 border focus:ring-2 focus:ring-black focus:border-black font-medium text-sm" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Confirm Password</label>
          <div className="relative">
            <input 
              required 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className={`w-full border rounded-xl shadow-sm p-3.5 pr-11 font-medium text-sm focus:ring-2 focus:ring-black focus:border-black ${
                confirmPassword && password !== confirmPassword 
                  ? 'border-red-400 bg-red-50/30' 
                  : 'border-gray-300'
              }`} 
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[11px] font-bold text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || isGoogleSubmitting}
          className="w-full bg-black text-white py-4 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Join Us</span>
          )}
        </button>
      </form>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <span className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or</span>
      </div>

      <div>
        <button 
          onClick={handleGoogle} 
          disabled={isSubmitting || isGoogleSubmitting}
          className="w-full bg-white border border-gray-300 text-slate-800 py-3.5 rounded-full font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50"
        >
          {isGoogleSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span>Sign in with Google</span>
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600">
        Already a member?{' '}
        <Link to="/login" className="font-bold text-black hover:underline">
          Sign In.
        </Link>
      </p>
    </div>
  );
}

