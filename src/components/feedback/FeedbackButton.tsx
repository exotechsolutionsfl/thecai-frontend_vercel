'use client'

import { useState } from 'react'
import { FeedbackModal } from './FeedbackModal'

export function FeedbackButton() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

  const handleFeedbackSubmit = async (type: string, content: string) => {
    try {
      const response = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, content }),
      });

      if (response.ok) {
        console.log('Feedback submitted successfully');
        // You can add a toast notification here if you want
      } else {
        console.error('Failed to submit feedback');
        // You can add an error toast notification here
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // You can add an error toast notification here
    }
  };

  return (
    <>
      <button
        onClick={() => setIsFeedbackOpen(true)}
        className="bg-[#232323] text-[#FFA500] px-4 py-2 rounded-md hover:bg-[#2C2C2E] transition-colors duration-300"
        aria-label="Open feedback form"
      >
        Leave Feedback
      </button>
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  )
}