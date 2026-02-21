/**
 * Centralized navigation utilities for consistent routing behavior
 */
import type { NavigateFunction } from "react-router-dom";

/**
 * Navigate to home/dashboard
 * Uses replace to prevent back button issues
 */
export const navigateToHome = (navigate: NavigateFunction) => {
  navigate("/", { replace: true });
};

/**
 * Navigate to get-started (for logged out users)
 * Uses replace to clear navigation history
 */
export const navigateToGetStarted = (navigate: NavigateFunction) => {
  navigate("/get-started", { replace: true });
};

/**
 * Navigate to login
 * Uses replace to prevent back to protected routes
 */
export const navigateToLogin = (navigate: NavigateFunction) => {
  navigate("/login", { replace: true });
};

/**
 * Safe back navigation
 * If there's no history or user is on root, stays on home
 * Otherwise goes back
 */
export const navigateBack = (navigate: NavigateFunction) => {
  if (window.history.state && window.history.state.idx > 0) {
    navigate(-1);
  } else {
    navigateToHome(navigate);
  }
};

/**
 * Handle logout navigation
 * Clears to get-started page (not login)
 */
export const navigateAfterLogout = (navigate: NavigateFunction) => {
  navigateToGetStarted(navigate);
};

/**
 * Handle session end navigation
 * Goes to home with replace to prevent reopening session
 */
export const navigateAfterSessionEnd = (navigate: NavigateFunction) => {
  navigateToHome(navigate);
};
