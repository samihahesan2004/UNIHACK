"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthPage from "@/components/AuthPage";
import { AuthMode } from "@/lib/types";

export default function Page() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  const handleLogin = () => {
    router.push("/home");
  };

  const handleStartSignup = () => {
    router.push("/profile/setup");
  };

  return (
    <AuthPage
      authMode={authMode}
      setAuthMode={setAuthMode}
      authUsername={authUsername}
      setAuthUsername={setAuthUsername}
      authPassword={authPassword}
      setAuthPassword={setAuthPassword}
      onLogin={handleLogin}
      onStartSignup={handleStartSignup}
    />
  );
}