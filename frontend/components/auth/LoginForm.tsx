"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

/**
 * Reusable login form component.
 * Can be embedded in any page or modal.
 */
export function LoginForm() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      
      if (rememberMe) {
        localStorage.setItem("remembered_email", email);
      } else {
        localStorage.removeItem("remembered_email");
      }
      
      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/companion";
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath);
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#F8FAFC] mb-2">Welcome Back</h1>
        <p className="text-[#94A3B8]">Sign in to continue your journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{apiError}</p>
          </motion.div>
        )}

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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={`w-full pl-12 pr-4 py-3 bg-[#1E293B] border rounded-xl text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-[#334155] focus:border-[#6D28D9] focus:ring-[#6D28D9]/20"
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-400">{errors.email}</p>
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`w-full pl-12 pr-12 py-3 bg-[#1E293B] border rounded-xl text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 transition-all ${
                errors.password
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
          {errors.password && (
            <p className="mt-2 text-sm text-red-400">{errors.password}</p>
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
          disabled={isLoading || authLoading}
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
  );
}

export default LoginForm;
