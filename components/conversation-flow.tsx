"use client"

import { useState, useMemo, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import InteractionPage from "./conversation/interaction-page"
import InteractionDetailsCard from "./conversation/interaction-details-card"
import VerticalTimeline from "./conversation/vertical-timeline"
import ConversationSelector from "./conversation/conversation-selector"
import { useConversationData } from "@/hooks/use-conversation-data"
import { useSearchParams, useRouter } from "next/navigation"

const resultOptions = ["success", "pending", "failed", "in_progress"]

export default function ConversationFlow() {
  /* ---------- data ---------- */
  const { conversations, loading, error } = useConversationData()

  /* ---------- URL handling ---------- */
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlSessionId = searchParams.get("session_id") ?? undefined

  /* ---------- which conversation is selected? ---------- */
  const selectedConversationIndex = useMemo(() => {
    if (!urlSessionId) return 0
    const idx = conversations.findIndex((c) => c.session_id === urlSessionId)
    return idx >= 0 ? idx : 0
  }, [urlSessionId, conversations])

  const selectedConversation = conversations[selectedConversationIndex]
  const sessionId = selectedConversation?.session_id ?? "unknown"

  /* ---------- helper to push session_id into the URL ---------- */
  const setSessionIdInUrl = (id: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set("session_id", id)
    router.push(url.pathname + url.search, { scroll: false })
  }

  /* ---------- interaction (message‐group) processing ---------- */
  const groupedInteractions = useMemo(() => {
    if (!selectedConversation?.conversation_history) return []

    const records = selectedConversation.conversation_history
    if (!Array.isArray(records) || records.length === 0) return []

    const groups: {
      customerMessage: string
      agentMessages: string[]
      interactionNumber: number
      result: string
      timestamp: string
    }[] = []

    let currentGroup: (typeof groups)[number] | null = null

    records.forEach((item, idx) => {
      let speaker: "customer" | "ai_agent" | undefined
      let message: string | undefined

      if (typeof item === "string") {
        speaker = idx % 2 === 0 ? "customer" : "ai_agent"
        message = item
      } else if (typeof item === "object" && item !== null) {
        if (item.customer) {
          speaker = "customer"
          message = item.customer
        } else if (item.ai_agent) {
          speaker = "ai_agent"
          message = item.ai_agent
        } else if (item.role && item.content) {
          speaker = item.role === "user" || item.role === "customer" ? "customer" : "ai_agent"
          message = item.content
        }
      }

      if (!speaker || !message) return

      if (speaker === "customer") {
        if (currentGroup) groups.push(currentGroup)
        currentGroup = {
          customerMessage: message,
          agentMessages: [],
          interactionNumber: groups.length + 1,
          result: resultOptions[Math.floor(Math.random() * resultOptions.length)],
          timestamp: new Date().toISOString(),
        }
      } else if (speaker === "ai_agent" && currentGroup) {
        currentGroup.agentMessages.push(message)
      }
    })

    if (currentGroup) groups.push(currentGroup)
    return groups
  }, [selectedConversation])

  /* ---------- interaction selection ---------- */
  const [selectedInteractionIndex, setSelectedInteractionIndex] = useState(0)

  /* reset interaction index when conversation changes */
  useEffect(() => setSelectedInteractionIndex(0), [selectedConversationIndex])

  const selectedInteraction = groupedInteractions[selectedInteractionIndex]

  /* ---------- handlers ---------- */
  const handleConversationSelect = (idx: number) => {
    const conv = conversations[idx]
    if (conv?.session_id) setSessionIdInUrl(conv.session_id)
  }

  const handlePrevConv = () => {
    if (selectedConversationIndex > 0) setSessionIdInUrl(conversations[selectedConversationIndex - 1].session_id)
  }
  const handleNextConv = () => {
    if (selectedConversationIndex < conversations.length - 1)
      setSessionIdInUrl(conversations[selectedConversationIndex + 1].session_id)
  }

  /* ---------- initial URL when none present ---------- */
  useEffect(() => {
    if (!urlSessionId && conversations[0]?.session_id) {
      setSessionIdInUrl(conversations[0].session_id)
    }
  }, [urlSessionId, conversations])

  /* ---------- loading / error ---------- */
  if (loading) return <p className="p-8 text-center">Loading conversations…</p>
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>
  if (!conversations.length) return <p className="p-8 text-center">No data.</p>

  /* ---------- UI ---------- */
  return (
    <div className="relative">
      <ConversationSelector
        conversations={conversations}
        selectedIndex={selectedConversationIndex}
        onSelect={handleConversationSelect}
      />

      <VerticalTimeline
        interactions={groupedInteractions}
        selectedIndex={selectedInteractionIndex}
        onSelect={setSelectedInteractionIndex}
      />

      <AnimatePresence mode="wait">
        <InteractionPage
          key={`${selectedConversationIndex}-${selectedInteractionIndex}`}
          interaction={selectedInteraction}
          onPrevious={() => setSelectedInteractionIndex((i) => Math.max(0, i - 1))}
          onNext={() => setSelectedInteractionIndex((i) => Math.min(groupedInteractions.length - 1, i + 1))}
          hasPrevious={selectedInteractionIndex > 0}
          hasNext={selectedInteractionIndex < groupedInteractions.length - 1}
          onPreviousConversation={handlePrevConv}
          onNextConversation={handleNextConv}
          hasPreviousConversation={selectedConversationIndex > 0}
          hasNextConversation={selectedConversationIndex < conversations.length - 1}
        />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {selectedInteraction && (
          <InteractionDetailsCard
            key={`${selectedConversationIndex}-${selectedInteractionIndex}`}
            sessionId={sessionId}
            interactionNumber={selectedInteraction.interactionNumber}
            conversationData={selectedConversation}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
