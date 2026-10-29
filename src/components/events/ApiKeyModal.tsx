"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Alert } from "@/ui/Alert";
import { Check, Key, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyUpdated?: () => void;
}

export function ApiKeyModal({ isOpen, onClose, onApiKeyUpdated }: ApiKeyModalProps) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "danger" | "info";
    text: string;
  } | null>(null);
  const [serverConfigured, setServerConfigured] = useState<boolean | null>(null);

  const [modelName, setModelName] = useState<string>("Gemini 3.8 Flash");

  useEffect(() => {
    if (isOpen) {
      // Check server status
      fetch("/api/health")
        .then((res) => res.json())
        .then((data) => {
          setServerConfigured(data.hasApiKey);
          const activeModel = data.modelDisplayName || "Gemini 3.8 Flash";
          setModelName(activeModel);
          if (data.hasApiKey) {
            setStatusMessage({
              type: "success",
              text: `${activeModel} engine is active and ready (source: ${data.source}).`,
            });
          }
        })
        .catch(() => {
          setServerConfigured(false);
        });

      // Load session key if any
      const existingKey = sessionStorage.getItem("planora_session_gemini_key");
      if (existingKey) {
        setApiKeyInput(existingKey);
      }
    }
  }, [isOpen]);

  const handleSaveSessionKey = () => {
    if (!apiKeyInput.trim()) {
      sessionStorage.removeItem("planora_session_gemini_key");
      setStatusMessage({
        type: "info",
        text: "Session key cleared. Planora will rely on .env.local on the server.",
      });
      onApiKeyUpdated?.();
      return;
    }

    sessionStorage.setItem("planora_session_gemini_key", apiKeyInput.trim());
    setStatusMessage({
      type: "success",
      text: "API Key saved for this browser session! It will be used securely for your AI requests.",
    });
    onApiKeyUpdated?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gemini AI Configuration"
      description="Connect your Google Gemini API key to unlock dynamic event synthesis and real-time planning."
    >
      <div className="space-y-4">
        {statusMessage && (
          <Alert variant={statusMessage.type === "success" ? "success" : statusMessage.type === "danger" ? "danger" : "info"}>
            {statusMessage.text}
          </Alert>
        )}

        <div className="p-4 rounded-xl bg-sand-50 border border-sand-200 space-y-2">
          <div className="flex items-center gap-2 text-forest-900 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-forest-700" />
            Recommended: Environment Variable
          </div>
          <p className="text-xs text-sand-600 leading-relaxed">
            For production safety, configure your key in <code className="bg-sand-200 px-1 py-0.5 rounded text-forest-900">.env.local</code> in the project root:
          </p>
          <pre className="text-xs font-mono bg-forest-950 text-sand-100 p-2.5 rounded-lg overflow-x-auto select-all">
            GEMINI_API_KEY=AIzaSy...
          </pre>
          <p className="text-[11px] text-sand-500">
            Keys in <code className="font-mono">.env.local</code> are accessed strictly server-side and never exposed to the client.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Input
            label="Or Provide Session Key (Optional)"
            type="password"
            placeholder="AIzaSy..."
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            helperText="Stored only in your browser's sessionStorage for this tab session."
          />

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-forest-700 hover:text-forest-900 underline inline-flex items-center gap-1 font-medium"
            >
              Get a Gemini API Key from Google AI Studio
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveSessionKey}>
                Save Session Key
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
