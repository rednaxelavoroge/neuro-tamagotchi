"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** URL to redirect to if not authenticated */
  redirectTo?: string;
  /** Show a loading state while checking auth */
  showLoading?: boolean;
}

/**
 * Protected route component that requires authentication.
 * 
 * Wraps protected pages and redirects to login if user is not authenticated.
 * Shows a loading state while checking authentication status.
 * 
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  redirectTo = "/auth/login",
  showLoading = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for loading to complete before checking auth
    if (!isLoading && !isAuthenticated) {
      // Store the intended destination for redirect after login
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath !== redirectTo) {
          sessionStorage.setItem("redirectAfterLogin", currentPath);
        }
      }
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading && showLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#6D28D9]/20" />
            <motion.div
              className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[#6D28D9]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="text-[#94A3B8] text-sm animate-pulse">
            Loading...
          </p>
        </motion.div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#6D28D9]/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#6D28D9]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Authentication Required
            </h2>
            <p className="text-[#94A3B8] text-sm">
              Redirecting to login...
            </p>
          </div>
          <Loader2 className="w-6 h-6 text-[#6D28D9] animate-spin" />
        </motion.div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
}

export default ProtectedRoute;


