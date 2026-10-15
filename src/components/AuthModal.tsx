/**
 * User Authentication Modal with Email/Password Sign Up, Sign In, 
 * Password Strength Meter, Rate-Limiting Protection, and Cadre Affiliation.
 */

import React, { useState, useMemo } from 'react';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import { NIGERIAN_FACILITIES } from '../data/mockHospitalData';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Building, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  ShieldAlert,
  Clock
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin'
}) => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    lockoutRemainingSeconds 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [role, setRole] = useState<UserProfile['role']>('Epidemiologist');
  const [facility, setFacility] = useState<string>('University College Hospital (UCH) Ibadan');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Password Security Strength Calculation
  const passwordSecurity = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    let score = 0;
    if (hasMinLength) score += 1;
    if (hasUpper && hasLower) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;

    let label = 'Very Weak';
    let color = 'bg-rose-500';
    if (score === 2) {
      label = 'Fair';
      color = 'bg-amber-500';
    } else if (score === 3) {
      label = 'Good';
      color = 'bg-sky-600';
    } else if (score >= 4) {
      label = 'Strong';
      color = 'bg-emerald-600';
    }

    return {
      score,
      label,
      color,
      hasMinLength,
      hasUpper,
      hasNumber,
      hasSpecial,
      isAcceptable: score >= 3
    };
  }, [password]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (lockoutRemainingSeconds > 0) {
      setErrorMessage(`Authentication Locked: Please wait ${lockoutRemainingSeconds}s before attempting again.`);
      return;
    }

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (!passwordSecurity.isAcceptable) {
        setErrorMessage('Password must be at least 8 characters with a number and uppercase letter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }
      if (!displayName.trim()) {
        setErrorMessage('Please provide your name or professional title.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName, role, facility);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
              <Lock className="w-3.5 h-3.5 text-teal-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {mode === 'signin' ? 'Sign In to Clinical Workspace' : 'Register Analyst Account'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Secure access for hospital epidemiologists & researchers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lockout Banner */}
        {lockoutRemainingSeconds > 0 && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 flex items-center gap-2 text-xs text-rose-800 font-medium">
            <Clock className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
            <span>
              Brute-Force Guard Active: Locked for {lockoutRemainingSeconds}s due to consecutive failed attempts.
            </span>
          </div>
        )}

        {/* Mode Selector Tab Strip */}
        <div className="grid grid-cols-2 border-b border-slate-200 text-xs font-semibold text-center bg-slate-50">
          <button
            onClick={() => { setMode('signin'); setErrorMessage(null); }}
            className={`py-2.5 transition-colors cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-teal-900 border-b-2 border-teal-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setErrorMessage(null); }}
            className={`py-2.5 transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-teal-900 border-b-2 border-teal-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sign Up Profile Fields */}
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name & Professional Title</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ngozi Adeleke, MBBS"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Clinical Cadre</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:outline-teal-600 cursor-pointer"
                  >
                    <option value="Epidemiologist">Epidemiologist</option>
                    <option value="Public Health Analyst">Public Health Analyst</option>
                    <option value="Hospital Medical Director">Medical Director</option>
                    <option value="Clinical Records Officer">Records Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Facility Affiliation</label>
                  <select
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:outline-teal-600 cursor-pointer"
                  >
                    {NIGERIAN_FACILITIES.map(f => (
                      <option key={f.id} value={f.name}>{f.shortName}</option>
                    ))}
                    <option value="Federal Ministry of Health">Federal MOH</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">Official / Institutional Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="analyst@uch-ibadan.org.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-teal-600"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-medium">Password</label>
              {mode === 'signup' && (
                <span className={`text-[10px] font-mono font-bold ${
                  passwordSecurity.score >= 3 ? 'text-emerald-700' : 'text-slate-400'
                }`}>
                  Strength: {passwordSecurity.label}
                </span>
              )}
            </div>

            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-9 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-teal-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Password Strength Meter on Sign Up */}
            {mode === 'signup' && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-300 ${passwordSecurity.color}`}
                    style={{ width: `${(passwordSecurity.score / 4) * 100}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1">
                  <span className={passwordSecurity.hasMinLength ? 'text-emerald-700 flex items-center gap-1' : ''}>
                    {passwordSecurity.hasMinLength ? '✓' : '·'} Min. 8 characters
                  </span>
                  <span className={passwordSecurity.hasUpper ? 'text-emerald-700 flex items-center gap-1' : ''}>
                    {passwordSecurity.hasUpper ? '✓' : '·'} Uppercase letter
                  </span>
                  <span className={passwordSecurity.hasNumber ? 'text-emerald-700 flex items-center gap-1' : ''}>
                    {passwordSecurity.hasNumber ? '✓' : '·'} Number (0-9)
                  </span>
                  <span className={passwordSecurity.hasSpecial ? 'text-emerald-700 flex items-center gap-1' : ''}>
                    {passwordSecurity.hasSpecial ? '✓' : '·'} Special symbol
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password (Sign Up only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-slate-700 font-medium mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-teal-600"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || lockoutRemainingSeconds > 0}
            className="w-full py-2 px-4 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : mode === 'signin' ? (
              <span>Sign In to Account</span>
            ) : (
              <span>Complete Analyst Registration</span>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-slate-400">or continue with</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isSubmitting || lockoutRemainingSeconds > 0}
            className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.15z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.94H1.28v3.15C3.31 21.36 7.37 24 12 24z"/>
              <path fill="#FBBC05" d="M5.32 14.26c-.24-.73-.38-1.5-.38-2.26s.14-1.53.38-2.26V6.59H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.41l4.04-3.15z"/>
              <path fill="#EA4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.37 0 3.31 2.64 1.28 6.59l4.04 3.15c.94-2.84 3.58-4.97 6.68-4.97z"/>
            </svg>
            <span>Sign In with Google</span>
          </button>

          {/* Security Notice Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-1 text-teal-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TLS 256-bit Encrypted</span>
            </div>
            <span>Zero-Trust Credential Hashing</span>
          </div>

        </form>

      </div>
    </div>
  );
};
