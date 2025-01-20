import type React from "react"
import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { Label } from "@/components/ui/label"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (type: string, feedback: string) => void
}

export function FeedbackModal({ isOpen, onClose, onSubmit }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<string>("issue")
  const [feedback, setFeedback] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      closeButtonRef.current?.focus()
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await onSubmit(feedbackType, feedback)
    setIsSubmitting(false)
    setFeedback("")
    setFeedbackType("issue")
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md mx-auto"
          onClick={(e) => e.stopPropagation()}
          ref={modalRef}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Leave Feedback</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  ref={closeButtonRef}
                  aria-label="Close feedback modal"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>We appreciate your feedback to help improve our service.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback-type">Feedback Type</Label>
                  <Select value={feedbackType} onValueChange={setFeedbackType}>
                    <SelectTrigger id="feedback-type">
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="issue">Report an Issue</SelectItem>
                      <SelectItem value="vehicle">Request a Vehicle</SelectItem>
                      <SelectItem value="suggestion">Suggestion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback-content">Feedback Details</Label>
                  <Textarea
                    id="feedback-content"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={
                      feedbackType === "issue"
                        ? "Describe the issue you've encountered..."
                        : feedbackType === "vehicle"
                          ? "Describe the vehicle you'd like us to add..."
                          : "Share your suggestion with us..."
                    }
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}