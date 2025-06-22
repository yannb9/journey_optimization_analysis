"use client"
import { ChevronDown, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ConversationSelectorProps {
  conversations: any[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export default function ConversationSelector({ conversations, selectedIndex, onSelect }: ConversationSelectorProps) {
  const selectedConversation = conversations[selectedIndex]

  const formatConversationTitle = (conversation: any, index: number) => {
    return `Session: ${conversation.session_id} | ID: ${conversation.id}`
  }

  const goToPrevious = () => {
    console.log("Previous clicked, current index:", selectedIndex)
    if (selectedIndex > 0) {
      console.log("Going to index:", selectedIndex - 1)
      onSelect(selectedIndex - 1)
    }
  }

  const goToNext = () => {
    console.log("Next clicked, current index:", selectedIndex)
    if (selectedIndex < conversations.length - 1) {
      console.log("Going to index:", selectedIndex + 1)
      onSelect(selectedIndex + 1)
    }
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="max-w-64 truncate">{formatConversationTitle(selectedConversation, selectedIndex)}</span>
            <span className="text-xs text-muted-foreground">
              ({selectedIndex + 1}/{conversations.length})
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-96 max-h-80 overflow-y-auto">
          {Object.entries(groupedConversations).map(([sessionId, sessionConversations]) => (
            <div key={sessionId}>
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50">
                Session: {sessionId}
              </div>
              {sessionConversations.map((conversation) => (
                <DropdownMenuItem
                  key={conversation.id}
                  onClick={() => onSelect(conversation.originalIndex)}
                  className={`cursor-pointer ml-2 ${conversation.originalIndex === selectedIndex ? "bg-accent" : ""}`}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <span className="font-medium">ID: {conversation.id}</span>
                    {conversation.conversation_history && conversation.conversation_history.length > 0 && (
                      <span className="text-xs text-muted-foreground truncate">
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
                </DropdownMenuItem>
              ))}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

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
