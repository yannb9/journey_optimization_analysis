"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
  Package,
  Copy,
  ExternalLink,
  Check,
} from "lucide-react"
import { useState } from "react"
import { useUrlParams } from "@/hooks/use-url-params"

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
  const { generateShareableUrl } = useUrlParams()
  const [selectedBatch, setSelectedBatch] = useState<{ title: string; data: any } | null>(null)
  const [copied, setCopied] = useState(false)

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
    if (!journeys) return "N/A"

    if (Array.isArray(journeys)) {
      if (journeys.length === 0) return "None"

      const titles = journeys.map((journey) => {
        if (typeof journey === "object" && journey !== null) {
          if (journey.title) return journey.title
          if (journey.name) return journey.name
          return String(journey)
        }
        return String(journey)
      })

      return titles.join(", ")
    }

    if (typeof journeys === "object" && journeys !== null) {
      if (journeys.title) return journeys.title
      if (journeys.name) return journeys.name
      return String(journeys)
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
    if (!data) return null
    if (typeof data === "string") {
      try {
        return JSON.parse(data)
      } catch {
        return data
      }
    }
    return data
  }

  const handleCopySessionLink = async () => {
    const shareableUrl = generateShareableUrl(sessionId)
    try {
      await navigator.clipboard.writeText(shareableUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  const handleOpenInNewTab = () => {
    const shareableUrl = generateShareableUrl(sessionId)
    window.open(shareableUrl, "_blank")
  }

  const hasBatch1 = conversationData?.batch_1_data
  const hasBatch2 =
    conversationData?.batch_2_data && conversationData.batch_2_data !== "" && conversationData.batch_2_data !== null

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
              {/* Session ID with Share Options */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md border bg-muted flex items-center justify-center">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Session ID</p>
                  <p className="font-mono text-sm font-semibold truncate">{sessionId}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleCopySessionLink}
                    title="Copy shareable link"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleOpenInNewTab}
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
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

              {/* Batch Data */}
              {(hasBatch1 || hasBatch2) && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md border bg-muted flex items-center justify-center">
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Batch Data</p>
                    <div className="flex gap-2 mt-1">
                      {hasBatch1 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="w-8 h-8 rounded-lg border-2 border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 transition-colors flex items-center justify-center text-xs font-semibold text-blue-600">
                              1
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Batch 1 Data</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap">
                                {JSON.stringify(formatBatchData(conversationData.batch_1_data), null, 2)}
                              </pre>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {hasBatch2 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="w-8 h-8 rounded-lg border-2 border-green-500/50 bg-green-500/10 hover:bg-green-500/20 transition-colors flex items-center justify-center text-xs font-semibold text-green-600">
                              2
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Batch 2 Data</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap">
                                {JSON.stringify(formatBatchData(conversationData.batch_2_data), null, 2)}
                              </pre>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
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
    </div>
  )
}
