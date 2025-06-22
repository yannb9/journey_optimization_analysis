"use client"
import { useState } from "react"
import type React from "react"

import { ChevronDown, MessageSquare, ChevronLeft, ChevronRight, Copy, ExternalLink, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConversationSelectorProps {
  conversations: any[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export default function ConversationSelector({ conversations, selectedIndex, onSelect }: ConversationSelectorProps) {
  const selectedConversation = conversations[selectedIndex]
  const [isOpen, setIsOpen] = useState(false)
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null)

  if (!selectedConversation) {
    return null
  }

  const formatConversationTitle = (conversation: any, index: number) => {
    return `Session: ${conversation.session_id} | ID: ${conversation.id}`
  }

  const goToPrevious = () => {
    if (selectedIndex > 0) {
      onSelect(selectedIndex - 1)
    }
  }

  const goToNext = () => {
    if (selectedIndex < conversations.length - 1) {
      onSelect(selectedIndex + 1)
    }
  }

  const handleCopyLink = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const baseUrl = window.location.origin + window.location.pathname
    const shareableUrl = `${baseUrl}?session_id=${sessionId}`

    try {
      await navigator.clipboard.writeText(shareableUrl)
      setCopiedSessionId(sessionId)
      setTimeout(() => setCopiedSessionId(null), 2000)
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  const handleOpenInNewTab = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const baseUrl = window.location.origin + window.location.pathname
    const shareableUrl = `${baseUrl}?session_id=${sessionId}`
    window.open(shareableUrl, "_blank")
  }

  const handleConversationSelect = (index: number) => {
    onSelect(index)
    setIsOpen(false)
  }

  // Group conversations by session_id for better display
  const groupedConversations = conversations.reduce(
    (acc, conv, index) => {
      if (!acc[conv.session_id]) {
        acc[conv.session_id] = []
      }
      acc[conv.session_id].push({ ...conv, originalIndex: index })
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <div className="fixed top-4 left-36 z-50 flex items-center gap-2">
      {/* Previous Button */}
      <Button variant="outline" size="sm" onClick={goToPrevious} disabled={selectedIndex === 0} className="px-2">
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Conversation Dropdown */}
      <div className="relative">
        <Button variant="outline" className="flex items-center gap-2 min-w-0" onClick={() => setIsOpen(!isOpen)}>
          <MessageSquare className="w-4 h-4 flex-shrink-0" />
          <span className="max-w-64 truncate">{formatConversationTitle(selectedConversation, selectedIndex)}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            ({selectedIndex + 1}/{conversations.length})
          </span>
          <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Dropdown Content */}
            <div className="absolute top-full left-0 mt-1 w-96 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg z-50">
              {Object.entries(groupedConversations).map(([sessionId, sessionConversations]) => (
                <div key={sessionId}>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 flex items-center justify-between border-b">
                    <span>Session: {sessionId}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={(e) => handleCopyLink(sessionId, e)}
                        title="Copy shareable link"
                      >
                        {copiedSessionId === sessionId ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={(e) => handleOpenInNewTab(sessionId, e)}
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {sessionConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation.originalIndex)}
                      className={`cursor-pointer px-4 py-2 hover:bg-gray-100 border-b border-gray-100 ${
                        conversation.originalIndex === selectedIndex ? "bg-blue-50 border-blue-200" : ""
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm">ID: {conversation.id}</span>
                        {conversation.conversation_history && conversation.conversation_history.length > 0 && (
                          <span className="text-xs text-gray-500 truncate">
                            {(() => {
                              const firstMessage = conversation.conversation_history[0]
                              if (firstMessage?.customer) return firstMessage.customer
                              if (firstMessage?.ai_agent) return firstMessage.ai_agent
                              if (firstMessage?.content) return firstMessage.content
                              if (firstMessage?.text) return firstMessage.text
                              if (firstMessage?.message) return firstMessage.message
                              if (firstMessage?.user) return firstMessage.user
                              return "No preview available"
                            })()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={goToNext}
        disabled={selectedIndex >= conversations.length - 1}
        className="px-2"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
