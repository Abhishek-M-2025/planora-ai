"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ApiKeyModal } from "../events/ApiKeyModal";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [modelDisplayName, setModelDisplayName] = useState<string>("Gemini 3.8 Flash");

  const checkStatus = () => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(Boolean(data.hasApiKey));
        if (data.modelDisplayName) {
          setModelDisplayName(data.modelDisplayName);
        }
      })
      .catch(() => {
        setHasApiKey(false);
      });
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="min-h-screen flex bg-sand-50/50 text-forest-950 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
          hasApiKey={hasApiKey}
          modelDisplayName={modelDisplayName}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
          hasApiKey={hasApiKey}
        />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto" id="main-content">
          {children}
        </main>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onApiKeyUpdated={checkStatus}
      />
    </div>
  );
}
