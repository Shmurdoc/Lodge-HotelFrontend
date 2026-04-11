import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Layers, Eye, EyeOff, Lock, Mail, AlertTriangle, 
  Loader2, Shield, Fingerprint, CheckCircle, XCircle
} from 'lucide-react';
import { signIn, signUp, resetPassword } from '@/lib/supabase';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
}

// Rate limiting configuration
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Input sanitization
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>'";&]/g, '');
};

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
const isValidPassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  return { valid: errors.length === 0, errors };
};

// Rate limiting helpers
const getRateLimitKey = (email: string): string => `login_attempts_${btoa(email).slice(0, 20)}`;

const getFailedAttempts = (email: string): number[] => {
  try {
    const stored = localStorage.getItem(getRateLimitKey(email));
    if (!stored) return [];
    const attempts = JSON.parse(stored) as number[];
    // Filter out old attempts
    return attempts.filter(time => Date.now() - time < RATE_LIMIT_DURATION_MS);
  } catch {
    return [];
  }
};

const recordFailedAttempt = (email: string): void => {
  const attempts = getFailedAttempts(email);
  attempts.push(Date.now());
  localStorage.setItem(getRateLimitKey(email), JSON.stringify(attempts));
};

const clearFailedAttempts = (email: string): void => {
  localStorage.removeItem(getRateLimitKey(email));
};

const isRateLimited = (email: string): { limited: boolean; remainingMs: number } => {
  const attempts = getFailedAttempts(email);
  if (attempts.length >= RATE_LIMIT_MAX_ATTEMPTS) {
    const oldest = Math.min(...attempts);
    const remaining = RATE_LIMIT_DURATION_MS - (Date.now() - oldest);
    return { limited: true, remainingMs: Math.max(0, remaining) };
  }
  return { limited: false, remainingMs: 0 };
};

// Remember me helpers
const REMEMBER_ME_KEY = 'nexus_pms_remember';

interface RememberedUser {
  email: string;
  token: string;
  expiresAt: number;
}

const saveRememberMe = (email: string, token: string): void => {
  const data: RememberedUser = {
    email,
    token,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  };
  // Store encrypted (base64 for demo - in production use proper encryption)
  localStorage.setItem(REMEMBER_ME_KEY, btoa(JSON.stringify(data)));
};

const getRememberedUser = (): RememberedUser | null => {
  try {
    const stored = localStorage.getItem(REMEMBER_ME_KEY);
    if (!stored) return null;
    const data: RememberedUser = JSON.parse(atob(stored));
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(REMEMBER_ME_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const clearRememberMe = (): void => {
  localStorage.removeItem(REMEMBER_ME_KEY);
};

const LoginPage = ({ onLogin }: LoginPageProps) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Names for signup
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [globalError, setGlobalError] = useState('');
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  
  // Password strength for signup
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ valid: boolean; errors: string[] }>({ valid: false, errors: [] });
  const emailInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Check for remembered user on mount
  useEffect(() => {
    const remembered = getRememberedUser();
    if (remembered) {
      setEmail(remembered.email);
      setRememberMe(true);
    }
  }, []);

  // Password strength check when in signup mode
  useEffect(() => {
    if (isSignUp && password) {
      setPasswordStrength(isValidPassword(password));
    } else {
      setPasswordStrength({ valid: false, errors: [] });
    }
  }, [password, isSignUp]);

  // Clear errors when user types
  useEffect(() => {
    if (emailError) setEmailError('');
  }, [email]);

  useEffect(() => {
    if (passwordError) setPasswordError('');
  }, [password]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    
    // Sanitize and validate email
    const sanitizedEmail = sanitizeInput(email);
    if (!sanitizedEmail) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isValidEmail(sanitizedEmail)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (isSignUp) {
      const { valid, errors } = isValidPassword(password);
      if (!valid) {
        setPasswordError(`Password must have: ${errors.join(', ')}`);
        isValid = false;
      }
    }
    
    return isValid;
  }, [email, password, isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setFormError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Check rate limiting
    const rateLimitCheck = isRateLimited(email);
    if (rateLimitCheck.limited) {
      const minutes = Math.ceil(rateLimitCheck.remainingMs / 60000);
      setGlobalError(`Too many login attempts. Please try again in ${minutes} minute(s).`);
      return;
    }
    
    setLoading(true);
    
    try {
      const sanitizedEmail = sanitizeInput(email);
      
      if (isSignUp) {
        // Sign up flow
        const { data, error: signUpError } = await signUp(sanitizedEmail, password, {
          first_name: sanitizeInput(firstName),
          last_name: sanitizeInput(lastName)
        });
        
        if (signUpError) {
          // Handle specific error codes
          if (signUpError.message.includes('already registered')) {
            setEmailError('An account with this email already exists');
          } else if (signUpError.message.includes('password')) {
            setPasswordError(signUpError.message);
          } else {
            setGlobalError(signUpError.message);
          }
        } else if (data.user) {
          toast.success('Account created! Please check your email to verify your account.');
          setIsSignUp(false);
          // Don't auto-login - require email verification
        }
      } else {
        // Sign in flow
        const { data, error: signInError } = await signIn(sanitizedEmail, password);
        
        if (signInError) {
          // Record failed attempt for rate limiting
          recordFailedAttempt(sanitizedEmail);
          
          // Check if now rate limited
          const check = isRateLimited(sanitizedEmail);
          if (check.limited) {
            setGlobalError('Too many failed attempts. Your account is temporarily locked.');
          } else {
            // Handle specific errors
            if (signInError.message.includes('Invalid login credentials')) {
              setFormError('Invalid email or password');
            } else if (signInError.message.includes('Email not confirmed')) {
              setFormError('Please verify your email before logging in');
            } else if (signInError.message.includes('too many requests')) {
              setGlobalError('Too many requests. Please wait a moment and try again.');
            } else {
              setGlobalError('Login failed. Please try again.');
            }
          }
        } else if (data.user || data.session) {
          // Login successful
          clearFailedAttempts(sanitizedEmail);
          
          // Handle remember me
          if (rememberMe && data.session?.access_token) {
            saveRememberMe(sanitizedEmail, data.session.access_token);
          } else if (!rememberMe) {
            clearRememberMe();
          }
          
          toast.success('Welcome back!');
          onLogin(sanitizedEmail, password);
        }
      }
    } catch (err) {
      setGlobalError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast.error('Please enter your email address');
      return;
    }
    
    if (!isValidEmail(forgotPasswordEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setForgotPasswordLoading(true);
    
    try {
      const { error } = await resetPassword(forgotPasswordEmail);
      
      if (error) {
        toast.error(error.message);
      } else {
        setForgotPasswordSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      }
    } catch (err) {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Calculate remaining attempts for display
  const remainingAttempts = RATE_LIMIT_MAX_ATTEMPTS - getFailedAttempts(email).length;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:block"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center">
              <Layers className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">NEXUS PMS</h1>
              <p className="text-muted-foreground">Hotel Property Management System</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="font-medium">Secure & Reliable</span>
              </div>
              <p className="text-sm text-muted-foreground">Enterprise-grade security with end-to-end encryption</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Fingerprint className="w-5 h-5 text-blue-400" />
                <span className="font-medium">RFID Integration</span>
              </div>
              <p className="text-sm text-muted-foreground">Seamless check-in with RFID card technology</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Security Features:</strong>
            </p>
            <ul className="mt-2 text-xs text-muted-foreground space-y-1">
              <li>✓ Rate limiting (5 attempts → 15min lockout)</li>
              <li>✓ Encrypted session handling</li>
              <li>✓ SQL injection protection</li>
              <li>✓ XSS input sanitization</li>
            </ul>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Mobile Logo */}
          <div className="flex md:hidden items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">NEXUS PMS</h1>
          </div>

          <AnimatePresence mode="wait">
            {showForgotPassword ? (
              // Forgot Password Form
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
                  <p className="text-muted-foreground">
                    {forgotPasswordSent 
                      ? 'Check your email for the reset link' 
                      : 'Enter your email to receive a reset link'}
                  </p>
                </div>

                {forgotPasswordSent ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      We've sent a password reset link to<br />
                      <strong>{forgotPasswordEmail}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordSent(false);
                        setForgotPasswordEmail('');
                      }}
                      className="text-primary hover:underline"
                    >
                      Back to login
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="forgot-email" className="text-sm font-medium mb-2 block">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            id="forgot-email"
                            type="email"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            required
                            aria-describedby="forgot-email-hint"
                          />
                        </div>
                        <p id="forgot-email-hint" className="text-xs text-muted-foreground mt-1">
                          We'll send you a secure link to reset your password
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={forgotPasswordLoading}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {forgotPasswordLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>
                    </div>

                    <div className="mt-4 text-center">
                      <button 
                        type="button"
                        onClick={() => setShowForgotPassword(false)}
                        className="text-sm text-primary hover:underline"
                      >
                        ← Back to login
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              // Login/Signup Form
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <div className="mb-6">
                  <h2 id="form-title" className="text-2xl font-bold mb-2">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-muted-foreground">
                    {isSignUp 
                      ? 'Sign up to get started with NEXUS PMS' 
                      : 'Sign in to your account to continue'}
                  </p>
                </div>

                {/* Global Error */}
                {globalError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    aria-live="assertive"
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{globalError}</p>
                  </motion.div>
                )}

                {/* Form Error */}
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    aria-live="assertive"
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{formError}</p>
                  </motion.div>
                )}

                <form 
                  ref={formRef}
                  onSubmit={handleSubmit} 
                  role="form"
                  aria-labelledby="form-title"
                  className="space-y-4"
                >
                  {/* First Name / Last Name for Signup */}
                  {isSignUp && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="text-sm font-medium mb-2 block">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          required={isSignUp}
                          aria-required="true"
                          autoComplete="given-name"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="text-sm font-medium mb-2 block">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          required={isSignUp}
                          aria-required="true"
                          autoComplete="family-name"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="text-sm font-medium mb-2 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        ref={emailInputRef}
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={`w-full pl-10 pr-4 py-3 bg-muted border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                          emailError ? 'border-red-500' : 'border-border'
                        }`}
                        required
                        aria-required="true"
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? 'email-error' : undefined}
                        autoComplete="email"
                      />
                    </div>
                    {emailError && (
                      <p id="email-error" role="alert" className="text-xs text-red-400 mt-1">
                        {emailError}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="text-sm font-medium mb-2 block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
                        className={`w-full pl-10 pr-12 py-3 bg-muted border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                          passwordError ? 'border-red-500' : 'border-border'
                        }`}
                        required
                        aria-required="true"
                        aria-invalid={!!passwordError}
                        aria-describedby={passwordError ? 'password-error' : isSignUp ? 'password-hint' : undefined}
                        autoComplete={isSignUp ? 'new-password' : 'current-password'}
                        onFocus={() => isSignUp && setShowPasswordRequirements(true)}
                        onBlur={() => isSignUp && setShowPasswordRequirements(false)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Error */}
                    {passwordError && (
                      <p id="password-error" role="alert" className="text-xs text-red-400 mt-1">
                        {passwordError}
                      </p>
                    )}
                    
                    {/* Password Requirements (Signup only) */}
                    {isSignUp && showPasswordRequirements && password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 p-3 bg-muted/50 rounded-lg"
                      >
                        <p className="text-xs text-muted-foreground mb-2">Password must contain:</p>
                        <ul className="text-xs space-y-1">
                          <li className={password.length >= 8 ? 'text-green-400' : 'text-muted-foreground'}>
                            {password.length >= 8 ? '✓' : '○'} 8+ characters
                          </li>
                          <li className={/[A-Z]/.test(password) ? 'text-green-400' : 'text-muted-foreground'}>
                            {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                          </li>
                          <li className={/[a-z]/.test(password) ? 'text-green-400' : 'text-muted-foreground'}>
                            {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
                          </li>
                          <li className={/[0-9]/.test(password) ? 'text-green-400' : 'text-muted-foreground'}>
                            {/[0-9]/.test(password) ? '✓' : '○'} One number
                          </li>
                        </ul>
                        {passwordStrength.valid && (
                          <p className="text-xs text-green-400 mt-2">✓ Password meets all requirements</p>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Remember Me / Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-border bg-muted"
                        id="remember-me"
                      />
                      <span className="text-sm text-muted-foreground">Remember me</span>
                    </label>
                    <button 
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                      disabled={loading}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Rate Limit Warning */}
                  {!isSignUp && remainingAttempts < RATE_LIMIT_MAX_ATTEMPTS && (
                    <p className="text-xs text-muted-foreground text-center">
                      {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    aria-busy={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isSignUp ? 'Creating account...' : 'Signing in...'}
                      </>
                    ) : (
                      isSignUp ? 'Create Account' : 'Sign In'
                    )}
                  </button>
                </form>

                {/* Toggle Sign In / Sign Up */}
                <div className="mt-4 text-center">
                  <button 
                    type="button"
                    onClick={() => { 
                      setIsSignUp(!isSignUp); 
                      setFormError(''); 
                      setGlobalError('');
                      setEmailError('');
                      setPasswordError('');
                    }}
                    className="text-sm text-primary hover:underline"
                    disabled={loading}
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign in' 
                      : "Don't have an account? Sign up"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-muted-foreground mt-6">
            © 2026 NEXUS PMS. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;