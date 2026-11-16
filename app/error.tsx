"use client";

import CrashScreen from "./crash-screen";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
};

const ErrorPage = ({ reset, unstable_retry }: ErrorPageProps) => (
  <CrashScreen onRestart={unstable_retry ?? reset} />
);

export default ErrorPage;
