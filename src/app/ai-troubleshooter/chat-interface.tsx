'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Star, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { State, Action } from './state'
import { apiFetch } from '@api/api'

const retryFetch = async (url: string, options = {}, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiFetch(url, options);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}

const groupMessages = (messages: State['chatHistory']) => {
  return messages.reduce((acc, message, index, array) => {
    if (index === 0 || message.role !== array[index - 1].role) {
      acc.push([message]);
    } else {
      acc[acc.length - 1].push(message);
    }
    return acc;
  }, [] as State['chatHistory'][]);
}

interface ChatInterfaceProps {
  state: State
  dispatch: React.Dispatch<Action>
}

interface FeedbackSectionProps {
  group: State['chatHistory'][0]
  toggleFeedback: (index: number) => void
  handleStarClick: (index: number, rating: number) => void
  submitFeedback: (index: number) => Promise<void>
  state: State
  dispatch: React.Dispatch<Action>
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ group, toggleFeedback, handleStarClick, submitFeedback, state, dispatch }) => {
  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleFeedback(state.chatHistory.findIndex(msg => msg.content === group.content))}
      >
        {group.showFeedback ? (
          <>
            <ChevronUp className="w-4 h-4 mr-1" />
            Hide Feedback
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 mr-1" />
            Give Feedback
          </>
        )}
      </Button>
      <AnimatePresence>
        {group.showFeedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2"
          >
            <Card>
              <CardContent className="pt-6">
                <h4 className="text-lg font-medium mb-2">Rate this response</h4>
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStarClick(state.chatHistory.findIndex(msg => msg.content === group.content), star)}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (group.rating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </Button>
                  ))}
                </div>
                <Textarea
                  placeholder="Additional comments (optional)"
                  className="mb-4"
                  rows={3}
                  onChange={(e) => {
                    dispatch({
                      type: 'SET_CHAT_HISTORY',
                      payload: state.chatHistory.map((msg, i) =>
                        i === state.chatHistory.findIndex(msg => msg.content === group.content
                        ) ? { ...msg, comments: e.target.value } : msg
                      ),
                    });
                  }}
                />
                {group.rating && !group.feedbackSubmitted && (
                  <Button
                    onClick={() => submitFeedback(state.chatHistory.findIndex(msg => msg.content === group.content))}
                    disabled={group.feedbackLoading}
                  >
                    {group.feedbackLoading ? (
                      <Settings className="w-5 h-5 animate-spin mr-2" />
                    ) : null}
                    Submit Feedback
                  </Button>
                )}
                <AnimatePresence>
                  {group.feedbackError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{group.feedbackError}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Component({ state, dispatch }: ChatInterfaceProps) {
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [state.chatHistory])

  useEffect(() => {
    dispatch({ type: 'CLEAR_CHAT_HISTORY' });
  }, [state.selectedMake, state.selectedModel, state.selectedYear, dispatch]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    setShowScrollButton(scrollHeight - scrollTop > clientHeight + 100)
  }

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSearch = async () => {
    if (!state.selectedMake || !state.selectedModel || !state.selectedYear || !state.query) return;
    
    dispatch({ type: 'SET_LOADING', payload: { search: true } });
    const userMessage = { role: 'user', content: state.query };
    dispatch({ type: 'SET_CHAT_HISTORY', payload: [...state.chatHistory, userMessage] });
    
    try {
      const searchParams = new URLSearchParams({
        make: state.selectedMake,
        model: state.selectedModel,
        year: state.selectedYear,
        query: state.query,
      });

      const data = await retryFetch(`api/search?${searchParams.toString()}`);

      const gptResponse = data.gpt_response || "I'm sorry, I couldn't generate a response. Please try again.";

      dispatch({ type: 'SET_CHAT_HISTORY', payload: [...state.chatHistory, userMessage, { role: 'assistant', content: gptResponse, showFeedback: false }] });
      dispatch({ type: 'SET_QUERY', payload: '' });
    } catch (error) {
      console.error('Error performing search', error);
      let errorMessage = 'An error occurred. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: 'SET_CHAT_HISTORY', payload: [...state.chatHistory, userMessage, { role: 'assistant', content: errorMessage, showFeedback: false }] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { search: false } });
    }
  };

  const toggleFeedback = (index: number) => dispatch({
    type: 'SET_CHAT_HISTORY',
    payload: state.chatHistory.map((msg, i) =>
      i === index ? { ...msg, showFeedback: !msg.showFeedback } : msg
    ),
  });

  const handleStarClick = (index: number, rating: number) =>
    dispatch({
      type: 'SET_CHAT_HISTORY',
      payload: state.chatHistory.map((msg, i) =>
        i === index ? { ...msg, rating } : msg
      ),
    });

  const submitFeedback = async (index: number) => {
    const message = state.chatHistory[index]
    const userQuery = state.chatHistory[index - 1].content

    dispatch({
      type: 'SET_CHAT_HISTORY',
      payload: state.chatHistory.map((msg, i) =>
        i === index ? { ...msg, feedbackLoading: true, feedbackError: undefined, feedbackSuccess: false } : msg
      ),
    });

    try {
      const feedbackData = {
        query: userQuery,
        gpt_response: message.content,
        rating: message.rating || 0,
        comments: message.comments || null
      }

      const response = await apiFetch('api/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      })

      if (response && response.message === "Feedback submitted successfully") {
        dispatch({
          type: 'SET_CHAT_HISTORY',
          payload: state.chatHistory.map((msg, i) =>
            i === index ? { ...msg, feedbackSubmitted: true, feedbackLoading: false, feedbackSuccess: true, feedbackError: undefined } : msg
          ),
        });
      } else {
        throw new Error(response.message || 'Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback', error)
      let errorMessage = 'Failed to submit feedback. Please try again.'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      dispatch({
        type: 'SET_CHAT_HISTORY',
        payload: state.chatHistory.map((msg, i) =>
          i === index ? { ...msg, feedbackLoading: false, feedbackSuccess: false, feedbackError: errorMessage } : msg
        ),
      });
    }
  }

  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex flex-col transition-all duration-500 ease-in-out pt-16"
    >
      <Button
        variant="outline"
        className="mb-4"
        onClick={() => {
          dispatch({ type: 'SET_SHOW_CHAT', payload: false });
          dispatch({ type: 'CLEAR_CHAT_HISTORY' });
        }}
      >
        ← Back to Selection
      </Button>
      <Card className="flex-grow overflow-hidden">
        <CardContent className="h-full overflow-y-auto" onScroll={handleScroll}>
          <AnimatePresence>
            {groupMessages(state.chatHistory).map((group, groupIndex) => (
              <motion.div
                key={groupIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
                className={`mb-6 ${groupIndex === 0 ? 'mt-6' : ''}`}
              >
                {group.map((message, messageIndex) => (
                  <motion.div
                    key={messageIndex}
                    initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: messageIndex * 0.1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div className="flex flex-col">
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                      <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'} text-muted-foreground`}>
                        {new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {group[0].role === 'assistant' && !group[0].feedbackSubmitted && (
                  <FeedbackSection
                    group={group[0]}
                    toggleFeedback={toggleFeedback}
                    handleStarClick={handleStarClick}
                    submitFeedback={submitFeedback}
                    state={state}
                    dispatch={dispatch}
                  />
                )}
                <AnimatePresence>
                  {group[0].feedbackSubmitted && group[0].feedbackSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert className="mt-2">
                        <AlertDescription>Thank you for your feedback!</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </CardContent>
      </Card>
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4"
          >
            <Button
              size="icon"
              onClick={scrollToBottom}
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-4">
        <div className="flex space-x-4">
          <div className="flex-grow relative">
            <Input
              type="text"
              value={state.query}
              onChange={(e) => dispatch({ type: 'SET_QUERY', payload: e.target.value.slice(0, 280) })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Type your question here..."
              disabled={state.loading.search}
            />
            <span className="absolute right-3 bottom-3 text-sm text-muted-foreground">
              {state.query.length}/280
            </span>
          </div>
          <Button onClick={handleSearch} disabled={!state.query || state.loading.search}>
            {state.loading.search ? (
              <Settings className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}