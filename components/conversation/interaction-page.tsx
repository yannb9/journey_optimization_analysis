"use client"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

const pageVariants = {
  initial: {
    opacity: 0,
    x: 300,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: -300,
  },
}

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
}

interface InteractionPageProps {
  interaction: any
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
  onPreviousConversation?: () => void
  onNextConversation?: () => void
  hasPreviousConversation?: boolean
  hasNextConversation?: boolean
}

export default function InteractionPage({
  interaction,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  onPreviousConversation,
  onNextConversation,
  hasPreviousConversation = false,
  hasNextConversation = false,
}: InteractionPageProps) {
  if (!interaction) return null

  return (
    <div className="min-h-screen pl-32 bg-background">
      <div className="flex h-screen">
        {/* Main Content - Left Side Next to Timeline */}
        <motion.div
          key={interaction.interactionNumber}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="w-[50%] px-8 py-12 flex flex-col justify-center"
        >
          <div className="w-full">
            {/* Conversation Content */}
            <div className="space-y-5">
              {/* Customer Message */}
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-primary">Customer</h3>
                <p className="text-sm text-foreground/90 leading-relaxed">{interaction.customerMessage}</p>
              </div>

              {/* Agent Messages */}
              {interaction.agentMessages.map((message, index) => (
                <div key={index} className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-muted-foreground">AI Agent</h3>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{message}</p>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log("Previous conversation button clicked")
                  if (onPreviousConversation && hasPreviousConversation) {
                    onPreviousConversation()
                  }
                }}
                disabled={!hasPreviousConversation}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border rounded-md hover:bg-accent bg-background"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* <div className="text-xs text-muted-foreground">Step {interaction.interactionNumber}</div> */}

              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log("Next conversation button clicked")
                  if (onNextConversation && hasNextConversation) {
                    onNextConversation()
                  }
                }}
                disabled={!hasNextConversation}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border rounded-md hover:bg-accent bg-background"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
