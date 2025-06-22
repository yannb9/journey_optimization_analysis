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
  const { conversations, loading, error } = useConversationData()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get session_id from URL
  const urlSessionId = searchParams.get("session_id")

  // Find conversation index based on URL session_id
  const selectedConversationIndex = useMemo(() => {
    if (!urlSessionId || conversations.length === 0) return 0
    const index = conversations.findIndex((conv) => conv.session_id === urlSessionId)
    return index >= 0 ? index : 0
  }, [urlSessionId, conversations])

  const [selectedInteractionIndex, setSelectedInteractionIndex] = useState(0)

  // Update URL when conversation changes
  const updateUrl = (sessionId: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set("session_id", sessionId)
    router.push(url.pathname + url.search, { scroll: false })
  }

  // Reset interaction index when conversation changes
  useEffect(() => {
    setSelectedInteractionIndex(0)
  }, [selectedConversationIndex])

  const selectedConversation = conversations[selectedConversationIndex]
  const sessionId = selectedConversation?.session_id || selectedConversation?.id || "Unknown"

  const groupedInteractions = useMemo(() => {
    if (!selectedConversation?.conversation_history) {
      console.log("No conversation_history found for selected conversation")
      return []
    }

    const conversationData = selectedConversation.conversation_history
    console.log("Processing conversation_history:", conversationData)

    if (!Array.isArray(conversationData) || conversationData.length === 0) {
      console.log("conversation_history is not a valid array or is empty")
      return []
    }

    const groups = []
    let currentGroup = null

    conversationData.forEach((item, index) => {
      console.log(`Processing message ${index}:`, item)

      let speaker, message

      if (typeof item === "object" && item !== null) {
        // Try different possible formats
        if (item.customer) {
          speaker = "customer"
          message = item.customer
        } else if (item.ai_agent) {
          speaker = "ai_agent"
          message = item.ai_agent
        } else if (item.role && item.content) {
          speaker = item.role === "user" || item.role === "customer" ? "customer" : "ai_agent"
          message = item.content
        } else if (item.type && item.text) {
          speaker = item.type === "user" || item.type === "customer" ? "customer" : "ai_agent"
          message = item.text
        } else if (item.sender && item.message) {
          speaker = item.sender === "user" || item.sender === "customer" ? "customer" : "ai_agent"
          message = item.message
        } else if (item.from && item.text) {
          speaker = item.from === "user" || item.from === "customer" ? "customer" : "ai_agent"
          message = item.text
        } else if (item.user && item.assistant) {
          // Handle format where both user and assistant are in same object
          if (item.user) {
            if (currentGroup) {
              groups.push(currentGroup)
            }
            currentGroup = {
              customerMessage: item.user,
              agentMessages: [],
              interactionNumber: groups.length + 1,
              result: resultOptions[Math.floor(Math.random() * resultOptions.length)],
              timestamp: new Date().toISOString(),
            }
          }
          if (item.assistant && currentGroup) {
            currentGroup.agentMessages.push(item.assistant)
          }
          return
        }
      } else if (typeof item === "string") {
        // If it's just a string, assume alternating pattern starting with customer
        speaker = index % 2 === 0 ? "customer" : "ai_agent"
        message = item
      }

      console.log(`Extracted - Speaker: ${speaker}, Message: ${message}`)

      if (!speaker || !message) {
        console.log("Skipping invalid message:", item)
        return
      }

      if (speaker === "customer") {
        if (currentGroup) {
          groups.push(currentGroup)
        }
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

    if (currentGroup) {
      groups.push(currentGroup)
    }

    console.log("Final processed groups:", groups)
    return groups
  }, [selectedConversation])

  const selectedInteraction = groupedInteractions[selectedInteractionIndex]

  const handleSelect = (index) => {
    setSelectedInteractionIndex(index)
  }

  const handleConversationChange = (index) => {
    const conversation = conversations[index]
    if (conversation?.session_id) {
      updateUrl(conversation.session_id)
    }
  }

  const handlePreviousConversation = () => {
    if (selectedConversationIndex > 0) {
      const conversation = conversations[selectedConversationIndex - 1]
      if (conversation?.session_id) {
        updateUrl(conversation.session_id)
      }
    }
  }

  const handleNextConversation = () => {
    if (selectedConversationIndex < conversations.length - 1) {
      const conversation = conversations[selectedConversationIndex + 1]
      if (conversation?.session_id) {
        updateUrl(conversation.session_id)
      }
    }
  }

  // Auto-select first conversation if no URL param is set
  useEffect(() => {
    if (!urlSessionId && conversations.length > 0 && conversations[0]?.session_id) {
      updateUrl(conversations[0].session_id)
    }
  }, [conversations, urlSessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading conversations:</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No conversations found with conversation_history data.</p>
          <p className="text-xs text-muted-foreground mt-2">Check the browser console for debugging information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <ConversationSelector
        conversations={conversations}
        selectedIndex={selectedConversationIndex}
        onSelect={handleConversationChange}
      />

      <VerticalTimeline
        interactions={groupedInteractions}
        selectedIndex={selectedInteractionIndex}
        onSelect={handleSelect}
      />

      <AnimatePresence mode="wait">
        <InteractionPage
          key={`${selectedConversationIndex}-${selectedInteractionIndex}`}
          interaction={selectedInteraction}
          onPrevious={() => setSelectedInteractionIndex(Math.max(0, selectedInteractionIndex - 1))}
          onNext={() =>
            setSelectedInteractionIndex(Math.min(groupedInteractions.length - 1, selectedInteractionIndex + 1))
          }
          hasPrevious={selectedInteractionIndex > 0}
          hasNext={selectedInteractionIndex < groupedInteractions.length - 1}
          onPreviousConversation={handlePreviousConversation}
          onNextConversation={handleNextConversation}
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
