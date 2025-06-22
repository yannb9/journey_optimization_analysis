"use client"
import { MessageSquare, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ConversationSelectorProps {
  conversations: any[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export default function ConversationSelector({ conversations, selectedIndex, onSelect }: ConversationSelectorProps) {
  const selectedConversation = conversations[selectedIndex]

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

  // Get unique sessions
  const uniqueSessions = Array.from(new Set(conversations.map((conv) => conv.session_id)))

  const handleSessionSelect = (sessionId: string) => {
    // Find the first conversation with this session_id
    const conversationIndex = conversations.findIndex((conv) => conv.session_id === sessionId)
    if (conversationIndex !== -1) {
      onSelect(conversationIndex)
    }
  }

  return (
    <div className="fixed top-4 left-36 z-50 flex items-center gap-2">
      {/* Previous Button */}
      <Button variant="outline" size="sm" onClick={goToPrevious} disabled={selectedIndex === 0} className="px-2">
        <ChevronLeft className="w-3 h-3" />
      </Button>

      {/* Session Select */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-3 h-3" />
        <Select value={selectedConversation?.session_id} onValueChange={handleSessionSelect}>
          <SelectTrigger className="w-64 text-sm">
            <SelectValue placeholder="Select a session" />
          </SelectTrigger>
          <SelectContent>
            {uniqueSessions.map((sessionId) => (
              <SelectItem key={sessionId} value={sessionId} className="text-sm">
                Session: {sessionId}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-[10px] text-muted-foreground">
          ({selectedIndex + 1}/{conversations.length})
        </span>
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={goToNext}
        disabled={selectedIndex >= conversations.length - 1}
        className="px-2"
      >
        <ChevronRight className="w-3 h-3" />
      </Button>
    </div>
  )
}
