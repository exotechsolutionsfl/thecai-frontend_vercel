"use client"

import React, { useState, useCallback } from "react"
import { FeedbackModal } from "./FeedbackModal"
import { Button } from "./Button"
import { MessageSquare } from "lucide-react"

export function FeedbackButton() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

  const handleFeedbackSubmit = useCallback(async (type: string, content: string) => {
    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, content }),
      })

      if (response.ok) {
        console.log("Feedback submitted successfully")
        // You can add a toast notification here if you want
      } else {
        console.error("Failed to submit feedback")
        // You can add an error toast notification here
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      // You can add an error toast notification here
    }
  }, [])

  const openFeedbackModal = useCallback(() => setIsFeedbackOpen(true), [])
  const closeFeedbackModal = useCallback(() => setIsFeedbackOpen(false), [])

  return (
    <>
      <Button
        onClick={openFeedbackModal}
        variant="outline"
        size="sm"
        className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Leave Feedback
      </Button>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={closeFeedbackModal} onSubmit={handleFeedbackSubmit} />
    </>
  )
}