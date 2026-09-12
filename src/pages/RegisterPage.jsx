import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
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

  const { register, user, loading } = useAppContext();
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
          disabled={isSubmitting}
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
        <GoogleSignInButton />
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

