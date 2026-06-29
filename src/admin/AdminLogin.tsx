import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Layers, ArrowRight, ShieldAlert, KeyRound, Mail, Lock } from 'lucide-react';

const ATTEMPTS_KEY = 'admin-login-attempts';
const LOCKOUT_KEY = 'admin-login-lockout';
const MAX_ATTEMPTS = 2;
const LOCKOUT_SECONDS = 60;

function getAttempts(): number {
  return parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10);
}
function setAttempts(n: number) {
  localStorage.setItem(ATTEMPTS_KEY, String(n));
}
function getLockoutUntil(): number {
  return parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10);
}
function setLockoutUntil(ts: number) {
  localStorage.setItem(LOCKOUT_KEY, String(ts));
}
function clearLockout() {
  localStorage.removeItem(ATTEMPTS_KEY);
  localStorage.removeItem(LOCKOUT_KEY);
}

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Lockout countdown timer
  useEffect(() => {
    const tick = () => {
      const until = getLockoutUntil();
      const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setLockoutRemaining(remaining);
      if (remaining === 0 && until > 0) {
        clearLockout();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleFailedAttempt = useCallback(() => {
    const attempts = getAttempts() + 1;
    setAttempts(attempts);
    if (attempts >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_SECONDS * 1000;
      setLockoutUntil(until);
      setLockoutRemaining(LOCKOUT_SECONDS);
      setError(`Too many failed attempts. Access locked for ${LOCKOUT_SECONDS} seconds.`);
    } else {
      setError(`Invalid credentials. ${MAX_ATTEMPTS - attempts} attempt(s) remaining before lockout.`);
    }
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check lockout before doing anything
    const until = getLockoutUntil();
    if (until > Date.now()) {
      const remaining = Math.ceil((until - Date.now()) / 1000);
      setError(`Account locked. Try again in ${remaining}s.`);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured) {
      // Offline/fallback simulated admin login
      if (email.toLowerCase().includes('admin') && password === 'Admin@tile') {
        clearLockout();
        localStorage.setItem('sim-admin-session', 'true');
        onLoginSuccess();
      } else {
        handleFailedAttempt();
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Validate Admin role in profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user?.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not verify profile permissions.');
      }

      if ((profile as any).role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access denied. You do not have administrator privileges.');
      }

      clearLockout();
      onLoginSuccess();
    } catch (err: any) {
      handleFailedAttempt();
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured) {
      setError('Magic link requires Supabase connection configured.');
      setLoading(false);
      return;
    }

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/#/admin`,
        },
      });

      if (otpError) throw otpError;

      setMessage('Magic link sent to your email! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Magic link request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-root">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <div className="admin-login-logo-icon">
            <Layers size={20} color="white" />
          </div>
          <span style={{ fontStyle: 'normal', fontSize: '18px', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
            The Tile Store
          </span>
        </div>

        <div className="admin-login-title">Control Portal</div>
        <p className="admin-login-sub">Enter credentials to authenticate into the enterprise panel.</p>

        {lockoutRemaining > 0 && (
          <div className="admin-alert danger" style={{ padding: '10px 12px', fontSize: '12.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={14} style={{ flexShrink: 0 }} />
            <span>Account locked — {lockoutRemaining}s remaining. Too many failed attempts.</span>
          </div>
        )}

        {error && lockoutRemaining === 0 && (
          <div className="admin-alert danger" style={{ padding: '8px 12px', fontSize: '12.5px', marginBottom: '16px' }}>
            <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="admin-alert success" style={{ padding: '8px 12px', fontSize: '12.5px', marginBottom: '16px' }}>
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={useOtp ? handleMagicLinkLogin : handlePasswordLogin}>
          <div className="admin-form-group" style={{ marginBottom: '16px' }}>
            <label className="admin-form-label required">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--admin-text-tertiary)' }} />
              <input
                type="email"
                className="admin-input"
                style={{ paddingLeft: '34px' }}
                placeholder="admin@thetilestore.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {!useOtp && (
            <div className="admin-form-group" style={{ marginBottom: '20px' }}>
              <label className="admin-form-label required">Security Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--admin-text-tertiary)' }} />
                <input
                  type="password"
                  className="admin-input"
                  style={{ paddingLeft: '34px' }}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}
            disabled={loading || lockoutRemaining > 0}
          >
            {loading ? 'Authenticating...' : lockoutRemaining > 0 ? `Locked (${lockoutRemaining}s)` : 'Sign In'}
            {!loading && lockoutRemaining === 0 && <ArrowRight size={14} />}
          </button>

          <div style={{ textAlign: 'center', fontSize: '12.5px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-ghost admin-btn-sm"
              onClick={() => setUseOtp(!useOtp)}
              style={{ color: 'var(--admin-accent)' }}
            >
              {useOtp ? 'Use security password login' : 'Request OTP magic link instead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
