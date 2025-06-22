"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function VerticalTimeline({ interactions, selectedIndex, onSelect }) {
  const getDisplayItems = () => {
    const displaySlots = []

    // Slot 1: Previous or placeholder
    if (selectedIndex > 0) {
      displaySlots.push({
        type: "interaction",
        data: interactions[selectedIndex - 1],
        originalIndex: selectedIndex - 1,
      })
    } else {
      displaySlots.push({ type: "empty" })
    }

    // Slot 2: Current (active)
    if (interactions[selectedIndex]) {
      displaySlots.push({
        type: "interaction",
        data: interactions[selectedIndex],
        originalIndex: selectedIndex,
      })
    } else {
      displaySlots.push({ type: "empty" })
    }

    // Slot 3: Next or placeholder
    if (selectedIndex < interactions.length - 1) {
      displaySlots.push({
        type: "interaction",
        data: interactions[selectedIndex + 1],
        originalIndex: selectedIndex + 1,
      })
    } else {
      displaySlots.push({ type: "empty" })
    }

    return displaySlots
  }

  const displayItems = getDisplayItems()

  return (
    <div className="fixed left-0 top-0 h-full w-32 bg-card/80 backdrop-blur-sm border-r border-border flex flex-col justify-center z-50">
      <div className="relative flex flex-col items-center h-3/4">
        {/* Curved timeline line using SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="fadeGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.2" />
              <stop offset="20%" stopColor="white" stopOpacity="1" />
              <stop offset="80%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="strokeWidthGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgb(148, 163, 184)" stopOpacity="0.3" />
              <stop offset="15%" stopColor="rgb(148, 163, 184)" stopOpacity="1" />
              <stop offset="85%" stopColor="rgb(148, 163, 184)" stopOpacity="1" />
              <stop offset="100%" stopColor="rgb(148, 163, 184)" stopOpacity="0.3" />
            </linearGradient>
            <mask id="fadeMask">
              <rect x="0" y="0" width="128" height="300" fill="url(#fadeGradient)" />
            </mask>
          </defs>

          {/* Main curved line - bowing outward to touch the middle circle */}
          <path
            d="M 64 0 Q 134 150 64 300"
            stroke="url(#strokeWidthGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            mask="url(#fadeMask)"
          />

          {/* Progress line - follows the main curve to the middle point */}
          {selectedIndex > 0 && (
            <path
              d="M 64 0 Q 99 75 99 150"
              stroke="#adb5bd"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          )}
        </svg>

        <div className="flex flex-col justify-between h-full w-full">
          {displayItems.map((item, index) => {
            if (item.type === "empty") {
              return (
                <div key={`empty-${index}`} className="flex items-center h-16">
                  {/* No circle for empty slots */}
                </div>
              )
            }

            const interaction = item.data
            const isSelected = selectedIndex === item.originalIndex
            const isPassed = selectedIndex > item.originalIndex

            // Calculate position for circles along the curve
            let circleOffset = { x: 0, y: 0 }
            if (index === 0) {
              // Top circle - align with timeline line
              circleOffset = { x: 0, y: 0 }
            } else if (index === 1) {
              // Middle circle (active) - furthest out on the curve
              circleOffset = { x: 35, y: 0 }
            } else if (index === 2) {
              // Bottom circle - align with timeline line
              circleOffset = { x: 0, y: 0 }
            }

            return (
              <motion.div
                key={interaction.interactionNumber}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center relative h-16"
              >
                <button
                  onClick={() => onSelect(item.originalIndex)}
                  className={cn(
                    "relative z-10 w-3 h-3 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background absolute",
                    isSelected
                      ? "scale-200"
                      : isPassed
                        ? "bg-primary/60 border-primary hover:bg-primary hover:border-primary"
                        : "bg-background border-border hover:border-primary hover:bg-muted",
                  )}
                  style={{
                    left: index === 1 ? `calc(50% + ${circleOffset.x}px)` : "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: isSelected ? "#495057" : undefined,
                    borderColor: isSelected ? "#adb5bd" : undefined,
                  }}
                >
                  <span className="sr-only">Go to interaction {interaction.interactionNumber}</span>
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
