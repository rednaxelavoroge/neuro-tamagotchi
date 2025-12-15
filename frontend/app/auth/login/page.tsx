"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle, Bot } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

/**
 * Login page component
 * 
 * Features:
 * - Email and password inputs with validation
 * - Show/hide password toggle
 * - Remember me checkbox
 * - Error message display
 * - Loading state during authentication
 * - Links to register and forgot password
 * - Redirects to /companion after successful login
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Validation state
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/companion";
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath);
    }
  }, [isAuthenticated, authLoading, router]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("remembered_email");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  /**
   * Validate email format
   */
  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  /**
   * Validate password
   */
  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError("Password is required");
      return false;
    }
    if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate all fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("remembered_email", email);
      } else {
        localStorage.removeItem("remembered_email");
      }

      // Redirect to intended page or companion
      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/companion";
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6D28D9] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#10B981] flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#F8FAFC]">
              Neuro<span className="text-[#6D28D9]">Tamagotchi</span>
            </span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#F8FAFC] mb-2">
              Welcome Back
            </h1>
            <p className="text-[#94A3B8]">
              Sign in to continue your journey
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  onBlur={() => validateEmail(email)}
                  placeholder="your@email.com"
                  className={`w-full pl-12 pr-4 py-3 bg-[#1E293B] border rounded-xl text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 transition-all ${
                    emailError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-[#334155] focus:border-[#6D28D9] focus:ring-[#6D28D9]/20"
                  }`}
                />
              </div>
              {emailError && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  onBlur={() => validatePassword(password)}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-3 bg-[#1E293B] border rounded-xl text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 transition-all ${
                    passwordError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-[#334155] focus:border-[#6D28D9] focus:ring-[#6D28D9]/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F8FAFC] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#334155] bg-[#1E293B] text-[#6D28D9] focus:ring-[#6D28D9] focus:ring-offset-0"
                />
                <span className="text-sm text-[#94A3B8]">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#6D28D9] hover:text-[#7C3AED] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#6D28D9]/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-[#94A3B8]">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-[#6D28D9] hover:text-[#7C3AED] font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0F172A] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#6D28D9]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative text-center p-12"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-9xl mb-8"
          >
            👋
          </motion.div>
          <h2 className="text-3xl font-bold text-[#F8FAFC] mb-4">
            Welcome Back!
          </h2>
          <p className="text-lg text-[#94A3B8] max-w-sm">
            Your AI companion is waiting for you. Sign in to continue your journey.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
