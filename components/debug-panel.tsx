"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      // Simple connection test - just try to query the table
      const { data, error, count } = await supabase
        .from("journey_optimization_analysis")
        .select("*", { count: "exact" })
        .limit(5)

      setDebugInfo({
        connectionTest: error ? `Error: ${error.message}` : "Connection OK",
        tableExists: error ? `Table Error: ${error.message}` : "Table accessible",
        rowCount: count,
        sampleData: data,
        error: error?.message || null,
      })
    } catch (err) {
      setDebugInfo({
        error: err instanceof Error ? err.message : "Unknown error",
        connectionTest: "Failed",
      })
    }
    setLoading(false)
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Debug Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testConnection} disabled={loading}>
          {loading ? "Testing..." : "Test Supabase Connection"}
        </Button>

        {debugInfo && (
          <div className="mt-4 space-y-2">
            <div>
              <strong>Connection:</strong> {debugInfo.connectionTest}
            </div>
            <div>
              <strong>Table Access:</strong> {debugInfo.tableExists}
            </div>
            <div>
              <strong>Row Count:</strong> {debugInfo.rowCount}
            </div>
            {debugInfo.error && (
              <div className="text-red-500">
                <strong>Error:</strong> {debugInfo.error}
              </div>
            )}
            {debugInfo.sampleData && (
              <div>
                <strong>Sample Data:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.sampleData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
