import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { bootstrapTokenFromURL } from "@/lib/api";
import { AccessDenied } from "@/components/AccessDenied";
import { ChatApp } from "@/components/ChatApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AvinerLLM — Private AI Chat" },
      { name: "description", content: "AvinerLLM: a fast, private AI chat workspace powered by Ollama, accessed via secure magic links." },
      { property: "og:title", content: "AvinerLLM — Private AI Chat" },
      { property: "og:description", content: "Fast, private AI chat powered by Ollama. Token-only access." },
    ],
  }),
  component: Index,
});

function Index() {
  const [ready, setReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const t = bootstrapTokenFromURL();
    setHasToken(!!t);
    setReady(true);
  }, []);

  function acceptDevToken(token: string) {
    sessionStorage.setItem("aviner_token", token);
    setHasToken(true);
  }

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }
  if (!hasToken) return <AccessDenied onDevToken={acceptDevToken} />;
  return <ChatApp />;
}
