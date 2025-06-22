"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function useUrlParams() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const urlSessionId = searchParams.get("session_id")
    setSessionId(urlSessionId)
  }, [searchParams])

  const updateSessionIdInUrl = (newSessionId: string) => {
    const url = new URL(window.location.href)
    if (newSessionId) {
      url.searchParams.set("session_id", newSessionId)
    } else {
      url.searchParams.delete("session_id")
    }
    router.push(url.pathname + url.search, { scroll: false })
  }

  const generateShareableUrl = (sessionId: string) => {
    const baseUrl = window.location.origin + window.location.pathname
    return `${baseUrl}?session_id=${sessionId}`
  }

  return {
    sessionId,
    updateSessionIdInUrl,
    generateShareableUrl,
  }
}
