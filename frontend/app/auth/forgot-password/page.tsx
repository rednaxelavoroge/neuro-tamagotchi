"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle, Bot } from "lucide-react";

/**
 * Forgot password page component
 * 
 * Features:
 * - Email input with validation
 * - Success/error message display
 * - Loading state during submission
 * - Link back to login
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Request failed");
      }

      setSuccess(true);
    } catch (err) {
      // Always show success for security (don't reveal if email exists)
      setSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
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

        {!success ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#F8FAFC] mb-2">
                Forgot Password
              </h1>
              <p className="text-[#94A3B8]">
                Enter your email and we&apos;ll send you a reset link
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send Reset Link
                  </>
                )}
              </motion.button>
            </form>
          </>
        ) : (
          /* Success state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#10B981]/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[#10B981]" />
            </div>
            <h2 className="text-2xl font-bold text-[#F8FAFC] mb-3">
              Check Your Email
            </h2>
            <p className="text-[#94A3B8] mb-8">
              If an account exists with <span className="text-[#F8FAFC]">{email}</span>,
              you will receive a password reset link shortly.
            </p>
            <p className="text-sm text-[#64748B] mb-6">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                setEmail("");
              }}
              className="text-[#6D28D9] hover:text-[#7C3AED] font-medium transition-colors"
            >
              Try another email
            </button>
          </motion.div>
        )}

        {/* Back to login link */}
        <Link
          href="/auth/login"
          className="mt-8 flex items-center justify-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </motion.div>
    </div>
  );
}


