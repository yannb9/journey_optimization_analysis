"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Hash,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader,
  Route,
  Target,
  Zap,
  BarChart3,
  Timer,
  Database,
} from "lucide-react"
import { useState } from "react"

const cardVariants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.9,
  },
}

interface InteractionDetailsCardProps {
  sessionId: string
  interactionNumber: number
  conversationData: any
}

export default function InteractionDetailsCard({
  sessionId,
  interactionNumber,
  conversationData,
}: InteractionDetailsCardProps) {
  const [selectedBatch, setSelectedBatch] = useState<{ name: string; data: any } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "completed":
      case "active":
        return { icon: CheckCircle, color: "border-green-500/50 bg-green-500/10 text-green-400", label: status }
      case "pending":
      case "processing":
        return { icon: Clock, color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400", label: status }
      case "failed":
      case "error":
        return { icon: XCircle, color: "border-red-500/50 bg-red-500/10 text-red-400", label: status }
      case "in_progress":
      case "running":
        return { icon: Loader, color: "border-blue-500/50 bg-blue-500/10 text-blue-400", label: status }
      default:
        return {
          icon: AlertCircle,
          color: "border-slate-600 bg-slate-700/50 text-slate-400",
          label: status || "Unknown",
        }
    }
  }

  const statusConfig = getStatusConfig(conversationData?.relevant_journeys_status)
  const StatusIcon = statusConfig.icon

  const formatJourneys = (journeys) => {
    console.log("Raw journeys data:", journeys) // Debug log

    if (!journeys) return "N/A"

    if (Array.isArray(journeys)) {
      if (journeys.length === 0) return "None"

      // Extract titles from journey objects or use the values directly
      const titles = journeys.map((journey) => {
        if (typeof journey === "object" && journey !== null) {
          if (journey.title) return journey.title
          if (journey.name) return journey.name
          // If it's an object but no title/name, stringify it
          return JSON.stringify(journey)
        }
        // If it's a primitive value, convert to string
        return String(journey)
      })

      const result = titles.join(", ")
      console.log("Formatted result:", result) // Debug log
      return result
    }

    // Handle single object
    if (typeof journeys === "object" && journeys !== null) {
      if (journeys.title) return journeys.title
      if (journeys.name) return journeys.name
      return JSON.stringify(journeys)
    }

    return String(journeys)
  }

  const formatTime = (time) => {
    if (!time) return "N/A"
    if (typeof time === "number") {
      return `${time}s`
    }
    return String(time)
  }

  const formatBatchData = (data) => {
    if (!data) return "No data available"

    if (typeof data === "string") {
      try {
        // Try to parse if it's a JSON string
        const parsed = JSON.parse(data)
        return JSON.stringify(parsed, null, 2)
      } catch {
        return data
      }
    }

    if (typeof data === "object") {
      return JSON.stringify(data, null, 2)
    }

    return String(data)
  }

  const handleBatchClick = (batch: { name: string; data: any }) => {
    setSelectedBatch(batch)
    setIsDialogOpen(true)
  }

  // Get available batch data
  const batchData = []
  if (conversationData?.batch_1_data) {
    batchData.push({ name: "Batch 1", data: conversationData.batch_1_data })
  }
  if (conversationData?.batch_2_data) {
    batchData.push({ name: "Batch 2", data: conversationData.batch_2_data })
  }

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-[30%]">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${sessionId}-${interactionNumber}`}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Journey Analysis Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Session ID */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md border bg-muted flex items-center justify-center">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Session ID</p>
                  <p className="font-mono text-sm font-semibold">{sessionId}</p>
                </div>
              </div>

              {/* Relevant Journeys */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md border bg-muted flex items-center justify-center">
                  <Route className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Relevant Journeys</p>
                  <p className="text-sm font-medium">{formatJourneys(conversationData?.relevant_journeys)}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md border bg-muted flex items-center justify-center flex-shrink-0">
                  <StatusIcon
                    className={`w-4 h-4 text-muted-foreground ${conversationData?.relevant_journeys_status === "in_progress" || conversationData?.relevant_journeys_status === "running" ? "animate-spin" : ""}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Top 3 Predictable */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md border bg-muted flex items-center justify-center">
                  <Target className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Top Predictable</p>
                  <p className="text-sm font-medium">{formatJourneys(conversationData?.top_3_journeys)}</p>
                </div>
              </div>

              {/* Activated Journey */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md border bg-muted flex items-center justify-center">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Activated Journey</p>
                  <p className="text-sm font-medium">{conversationData?.activated_journey || "N/A"}</p>
                </div>
              </div>

              {/* Activated Journey In Top Predictable */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md border bg-muted flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">In Top Predictable</p>
                  <Badge variant={conversationData?.activated_journey_in_top_predictive ? "default" : "secondary"}>
                    {conversationData?.activated_journey_in_top_predictive ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>

              {/* Batch Generation Count */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md border bg-muted flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Batch Generation Count</p>
                  <p className="text-sm font-medium">{conversationData?.batch_generations_count || "0"}</p>
                </div>
              </div>

              {/* Batches */}
              {batchData.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md border bg-muted flex items-center justify-center flex-shrink-0">
                    <Database className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Batches</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {batchData.map((batch, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className={`text-xs w-8 h-8 p-0 font-semibold ${
                            index === 0
                              ? "bg-blue-500 hover:bg-blue-400 text-white border-blue-500"
                              : "bg-green-500 hover:bg-green-400 text-white border-green-500"
                          }`}
                          onClick={() => handleBatchClick(batch)}
                        >
                          {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Running Time */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md border bg-muted flex items-center justify-center">
                  <Timer className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Running Time</p>
                  <p className="text-sm font-medium">{formatTime(conversationData?.total_running_time)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Batch Data Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Batch {selectedBatch?.name.split(" ")[1]} Data</DialogTitle>
            <DialogDescription>Detailed batch data for this interaction</DialogDescription>
          </DialogHeader>
          <div className="mt-4 overflow-auto max-h-[60vh]">
            <pre className="text-xs bg-muted p-4 rounded-md whitespace-pre-wrap break-words">
              {selectedBatch ? formatBatchData(selectedBatch.data) : "No data available"}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
