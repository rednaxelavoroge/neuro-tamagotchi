"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Bot,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

/**
 * Register page component
 * 
 * Features:
 * - Email, username, password, and confirm password inputs
 * - Real-time validation with password strength indicators
 * - Show/hide password toggle
 * - Error and success message display
 * - Loading state during registration
 * - Auto-login after registration
 * - Redirects to /studio/step1 after successful registration
 */
export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Validation state
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/studio/step1");
    }
  }, [isAuthenticated, authLoading, router]);

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
   * Validate username
   */
  const validateUsername = (value: string): boolean => {
    if (!value) {
      setUsernameError("Username is required");
      return false;
    }
    if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return false;
    }
    if (value.length > 20) {
      setUsernameError("Username must be at most 20 characters");
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      setUsernameError("Username can only contain letters, numbers, underscores, and hyphens");
      return false;
    }
    setUsernameError("");
    return true;
  };

  /**
   * Check password strength
   */
  const checkPasswordStrength = (value: string) => {
    setPasswordStrength({
      hasMinLength: value.length >= 8,
      hasUppercase: /[A-Z]/.test(value),
      hasLowercase: /[a-z]/.test(value),
      hasNumber: /[0-9]/.test(value),
    });
  };

  /**
   * Validate password
   */
  const validatePassword = (value: string): boolean => {
    checkPasswordStrength(value);
    
    if (!value) {
      setPasswordError("Password is required");
      return false;
    }
    if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    if (!/[A-Z]/.test(value)) {
      setPasswordError("Password must contain at least 1 uppercase letter");
      return false;
    }
    if (!/[a-z]/.test(value)) {
      setPasswordError("Password must contain at least 1 lowercase letter");
      return false;
    }
    if (!/[0-9]/.test(value)) {
      setPasswordError("Password must contain at least 1 number");
      return false;
    }
    setPasswordError("");
    return true;
  };

  /**
   * Validate confirm password
   */
  const validateConfirmPassword = (value: string): boolean => {
    if (!value) {
      setConfirmPasswordError("Please confirm your password");
      return false;
    }
    if (value !== password) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError("");
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
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isEmailValid || !isUsernameValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, username);
      router.push("/studio/step1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = () => (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-[#64748B]">Password requirements:</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { key: "hasMinLength", label: "8+ characters" },
          { key: "hasUppercase", label: "Uppercase letter" },
          { key: "hasLowercase", label: "Lowercase letter" },
          { key: "hasNumber", label: "Number" },
        ].map(({ key, label }) => (
          <div
            key={key}
            className={`flex items-center gap-1.5 text-xs ${
              passwordStrength[key as keyof typeof passwordStrength]
                ? "text-[#10B981]"
                : "text-[#64748B]"
            }`}
          >
            {passwordStrength[key as keyof typeof passwordStrength] ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-current" />
            )}
            {label}
          </div>
        ))}
      </div>
    </div>
  );

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
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0F172A] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-[#6D28D9]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative text-center p-12"
        >
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-9xl mb-8"
          >
            ✨
          </motion.div>
          <h2 className="text-3xl font-bold text-[#F8FAFC] mb-4">
            Create Something Amazing
          </h2>
          <p className="text-lg text-[#94A3B8] max-w-sm">
            Design your unique AI companion and embark on an incredible journey together.
          </p>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-3 mb-8">
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
              Create Account
            </h1>
            <p className="text-[#94A3B8]">
              Start your AI companion journey
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
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Username field */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (usernameError) validateUsername(e.target.value);
                  }}
                  onBlur={() => validateUsername(username)}
                  placeholder="CoolUser123"
                  className={`w-full pl-12 pr-4 py-3 bg-[#1E293B] border rounded-xl text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 transition-all ${
                    usernameError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-[#334155] focus:border-[#6D28D9] focus:ring-[#6D28D9]/20"
                  }`}
                />
              </div>
              {usernameError && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {usernameError}
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
                    checkPasswordStrength(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                    if (confirmPassword) validateConfirmPassword(confirmPassword);
                  }}
                  onBlur={() => validatePassword(password)}
                  placeholder="Create a strong password"
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
              {password && <PasswordStrengthIndicator />}
            </div>

            {/* Confirm Password field */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmPasswordError) validateConfirmPassword(e.target.value);
                  }}
                  onBlur={() => validateConfirmPassword(confirmPassword)}
                  placeholder="Confirm your password"
                  className={`w-full pl-12 pr-12 py-3 bg-[#1E293B] border rounded-xl text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 transition-all ${
                    confirmPasswordError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-[#334155] focus:border-[#6D28D9] focus:ring-[#6D28D9]/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F8FAFC] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {confirmPasswordError}
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#334155] bg-[#1E293B] text-[#6D28D9] focus:ring-[#6D28D9] focus:ring-offset-0"
              />
              <label htmlFor="terms" className="text-sm text-[#94A3B8]">
                I agree to the{" "}
                <Link href="/terms" className="text-[#6D28D9] hover:text-[#7C3AED]">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#6D28D9] hover:text-[#7C3AED]">
                  Privacy Policy
                </Link>
              </label>
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
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </motion.button>
          </form>

          {/* Login link */}
          <p className="mt-8 text-center text-[#94A3B8]">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[#6D28D9] hover:text-[#7C3AED] font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
