"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  UserPlus,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface FormErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

/**
 * Reusable registration form component.
 * Can be embedded in any page or modal.
 */
export function RegisterForm() {
  const router = useRouter();
  const { register, isLoading: authLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
  });

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkPasswordStrength = (value: string) => {
    setPasswordStrength({
      hasMinLength: value.length >= 8,
      hasUppercase: /[A-Z]/.test(value),
      hasLowercase: /[a-z]/.test(value),
      hasNumber: /[0-9]/.test(value),
    });
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!username) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (username.length > 20) {
      newErrors.username = "Username must be at most 20 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      newErrors.username = "Username can only contain letters, numbers, underscores, and hyphens";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least 1 uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Password must contain at least 1 lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least 1 number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    if (!agreedToTerms) {
      setApiError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, username);
      router.push("/studio/step1");
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
              passwordStrength[key as keyof PasswordStrength]
                ? "text-[#10B981]"
                : "text-[#64748B]"
            }`}
          >
            {passwordStrength[key as keyof PasswordStrength] ? (
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#F8FAFC] mb-2">Create Account</h1>
        <p className="text-[#94A3B8]">Start your AI companion journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
              onChange={(e) => setUsername(e.target.value)}
              placeholder="CoolUser123"
              maxLength={20}
              className={`w-full pl-12 pr-4 py-3 bg-[#1E293B] border rounded-xl text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 transition-all ${
                errors.username
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-[#334155] focus:border-[#6D28D9] focus:ring-[#6D28D9]/20"
              }`}
            />
          </div>
          {errors.username && (
            <p className="mt-2 text-sm text-red-400">{errors.username}</p>
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
              }}
              placeholder="Create a strong password"
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
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className={`w-full pl-12 pr-12 py-3 bg-[#1E293B] border rounded-xl text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 transition-all ${
                errors.confirmPassword
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
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
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
          disabled={isLoading || authLoading}
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
  );
}

export default RegisterForm;
