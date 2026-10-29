"use client";

import React, { useState, useRef, useEffect } from "react";
import { EventPlan, ChatMessage } from "@/lib/types";
import { calculateBudgetSummary } from "@/lib/budget-calc";
import { updateEvent } from "@/lib/storage";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Alert } from "@/ui/Alert";
import { Sparkles, Send, Bot, User, CornerDownLeft, Key } from "lucide-react";

interface PlanRefinerChatProps {
  event: EventPlan;
  onEventUpdated: (updated: EventPlan) => void;
  onOpenApiKeyModal?: () => void;
}

export function PlanRefinerChat({
  event,
  onEventUpdated,
  onOpenApiKeyModal,
}: PlanRefinerChatProps) {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const budgetSummary = calculateBudgetSummary(event.totalBudget, event.budgetItems);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [event.chatHistory]);

  const quickPrompts = [
    `How can I trim $1,500 from catering without sacrificing guest experience?`,
    `Suggest 4 sensory decor elements for our ${event.themeConcept.title} concept.`,
    `Draft a detailed day-of schedule for photographers & videographers.`,
    `What contingency measures should we have for ${event.location}?`,
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setErrorNotice(null);
    setInputText("");

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    // Optimistically update chat history in storage
    const updatedWithUser = updateEvent(event.id, (prev) => ({
      ...prev,
      chatHistory: [...(prev.chatHistory || []), userMessage],
    }));

    if (updatedWithUser) {
      onEventUpdated(updatedWithUser);
    }

    setIsSending(true);

    try {
      const sessionKey = typeof window !== "undefined" ? sessionStorage.getItem("planora_session_gemini_key") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (sessionKey) {
        headers["x-gemini-api-key"] = sessionKey;
      }

      const res = await fetch("/api/assistant-chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: text,
          eventContext: {
            id: event.id,
            name: event.name,
            type: event.type,
            date: event.date,
            location: event.location,
            guestCount: event.guestCount,
            totalBudget: event.totalBudget,
            currency: event.currency,
            preferences: event.preferences,
            totalAllocated: budgetSummary.totalAllocated,
            totalActual: budgetSummary.totalActual,
            budgetRemaining: budgetSummary.remainingActual,
          },
          chatHistory: (event.chatHistory || []).map((m) => ({
            sender: m.sender,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "MISSING_API_KEY") {
          setErrorNotice(
            "Gemini API key is required to use the Planora AI Assistant. Configure your key in `.env.local` or the Settings modal."
          );
        } else {
          setErrorNotice(data.message || "Failed to process message with AI assistant.");
        }
        setIsSending(false);
        return;
      }

      const assistantMessage: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: "assistant",
        content: data.data.reply,
        timestamp: new Date().toISOString(),
        suggestedAction: data.data.suggestedAction,
      };

      const finalUpdated = updateEvent(event.id, (prev) => ({
        ...prev,
        chatHistory: [...(prev.chatHistory || []), assistantMessage],
      }));

      if (finalUpdated) {
        onEventUpdated(finalUpdated);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setErrorNotice(err.message || "Error connecting to AI assistant.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Strategist Header */}
      <div className="p-5 rounded-2xl bg-white border border-sand-200/90 shadow-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-900 text-sand-50 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-champagne-400" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-forest-950">
              Planora AI Event Strategist
            </h3>
            <p className="text-xs text-sand-600">
              Live context-aware consultation for {event.name}. Ask to adjust budgets, generate schedules, or draft communications.
            </p>
          </div>
        </div>
      </div>

      {errorNotice && (
        <Alert variant="warning" title="Gemini Engine Notice">
          <div className="space-y-2">
            <p>{errorNotice}</p>
            {onOpenApiKeyModal && (
              <Button
                variant="outline"
                size="sm"
                className="mt-1 text-xs gap-1.5 bg-white"
                onClick={onOpenApiKeyModal}
              >
                <Key className="w-3.5 h-3.5" />
                Configure API Key
              </Button>
            )}
          </div>
        </Alert>
      )}

      {/* Chat Window */}
      <Card className="flex flex-col h-[600px] overflow-hidden">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-sand-50/40">
          {(!event.chatHistory || event.chatHistory.length === 0) && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Sparkles className="w-8 h-8 text-champagne-600 animate-pulse" />
              <h4 className="font-serif font-bold text-lg text-forest-950">
                How can I refine your event blueprint?
              </h4>
              <p className="text-xs text-sand-500 max-w-sm">
                I have full awareness of your ${event.totalBudget.toLocaleString()} budget, {event.guestCount} guest count, and location.
              </p>
            </div>
          )}

          {event.chatHistory?.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? "bg-forest-900 text-sand-50"
                      : "bg-terracotta-100 text-terracotta-800 border border-terracotta-200"
                  }`}
                  aria-hidden="true"
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-subtle ${
                    isUser
                      ? "bg-forest-900 text-sand-50 rounded-tr-none"
                      : "bg-white text-forest-950 border border-sand-200 rounded-tl-none whitespace-pre-wrap font-sans"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-terracotta-100 text-terracotta-800 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-sand-200 rounded-2xl rounded-tl-none p-4 text-xs text-sand-500 flex items-center gap-2 shadow-subtle">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-terracotta-500" />
                <span>Planora Strategist is synthesizing recommendations...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt pills */}
        <div className="p-3 bg-white border-t border-sand-100 flex items-center gap-2 overflow-x-auto text-xs text-sand-600">
          <span className="font-semibold text-forest-950 shrink-0">Suggested:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isSending}
              className="px-3 py-1 rounded-full bg-sand-100 hover:bg-sand-200 text-forest-900 whitespace-nowrap transition-colors disabled:opacity-50 text-[11px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-3 bg-white border-t border-sand-200 flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Planora to adjust budget, suggest suppliers, or draft an itinerary..."
            rows={2}
            className="flex-1 resize-none rounded-xl border border-sand-300 p-2.5 text-sm text-forest-950 placeholder:text-sand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800"
          />
          <Button
            variant="terracotta"
            size="md"
            onClick={() => handleSendMessage()}
            isLoading={isSending}
            disabled={!inputText.trim()}
            className="h-12 px-5 gap-1.5"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
