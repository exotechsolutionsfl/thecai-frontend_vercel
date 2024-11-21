import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: string, feedback: string) => void;
}

export function FeedbackModal({ isOpen, onClose, onSubmit }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<string>('issue');
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(feedbackType, feedback);
    setIsSubmitting(false);
    setFeedback('');
    setFeedbackType('issue');
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      closeButtonRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-labelledby="feedback-modal-title"
        aria-describedby="feedback-modal-description"
        className="bg-[#232323] rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleTabKey}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="feedback-modal-title" className="text-xl font-bold text-[#FFA500]">Leave Feedback</h2>
          <button 
            ref={closeButtonRef}
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
            aria-label="Close feedback modal"
          >
            <X size={24} />
          </button>
        </div>
        <p id="feedback-modal-description" className="sr-only">
          This modal allows you to submit feedback. You can choose the type of feedback and provide details.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="feedback-type" className="block text-gray-300 mb-2">Feedback Type</label>
            <select
              id="feedback-type"
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full bg-[#1C1C1E] text-white border border-gray-600 rounded-md p-2"
            >
              <option value="issue">Report an Issue</option>
              <option value="vehicle">Request a Vehicle</option>
            </select>
          </div>
          <label htmlFor="feedback-content" className="block text-gray-300 mb-2">Feedback Details</label>
          <textarea
            id="feedback-content"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full bg-[#1C1C1E] text-white border border-gray-600 rounded-md p-2 mb-4"
            rows={4}
            placeholder={feedbackType === 'issue' ? "Describe the issue you've encountered..." : "Describe the vehicle you'd like us to add..."}
            required
          />
          <button
            ref={submitButtonRef}
            type="submit"
            className="w-full bg-[#FFA500] text-white py-2 rounded-md hover:bg-[#FFB733] transition-colors duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}