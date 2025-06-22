"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface ConversationData {
  id: string
  session_id: string
  conversation_history: any[]
  [key: string]: any
}

export function useConversationData() {
  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConversations() {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching conversations from journey_optimization_analysis...")

        const { data, error } = await supabase
          .from("journey_optimization_analysis")
          .select("*")
          .order("session_id", { ascending: true })
          .order("id", { ascending: true })

        if (error) {
          console.error("Supabase error:", error)
          throw new Error(`Database error: ${error.message}`)
        }

        console.log("Raw data from Supabase (ordered by session_id, then id):", data)

        if (!data || data.length === 0) {
          console.log("No data found in table")
          setConversations([])
          return
        }

        // Filter and process conversations that have conversation_history
        const validConversations = data
          .filter((row) => {
            const hasConversationHistory =
              row.conversation_history &&
              (Array.isArray(row.conversation_history) || typeof row.conversation_history === "object")

            console.log(
              `Row ${row.id} (Session: ${row.session_id}): has conversation_history =`,
              hasConversationHistory,
            )
            if (hasConversationHistory) {
              console.log(`Conversation history for ${row.id}:`, row.conversation_history)
            }

            return hasConversationHistory
          })
          .map((row) => ({
            ...row,
            // Ensure conversation_history is an array
            conversation_history: Array.isArray(row.conversation_history)
              ? row.conversation_history
              : [row.conversation_history],
          }))

        console.log(`Found ${validConversations.length} valid conversations with conversation_history`)
        console.log(
          "Valid conversations (grouped by session_id, ordered by id):",
          validConversations.map((c) => ({ id: c.id, session_id: c.session_id, hasHistory: !!c.conversation_history })),
        )

        // Group by session_id for logging
        const groupedBySessions = validConversations.reduce(
          (acc, conv) => {
            if (!acc[conv.session_id]) {
              acc[conv.session_id] = []
            }
            acc[conv.session_id].push(conv.id)
            return acc
          },
          {} as Record<string, string[]>,
        )

        console.log("Conversations grouped by session_id:", groupedBySessions)

        setConversations(validConversations)
      } catch (err) {
        console.error("Fetch error:", err)
        setError(err instanceof Error ? err.message : "An error occurred while fetching conversations")
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  return { conversations, loading, error }
}
