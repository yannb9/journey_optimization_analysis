import { Suspense } from "react"
import ConversationFlow from "@/components/conversation-flow"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div className="p-4 text-muted-foreground">Loading…</div>}>
        <ConversationFlow />
      </Suspense>
    </main>
  )
}
