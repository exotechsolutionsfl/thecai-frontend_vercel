'use client'

import React from 'react';
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Star, ChevronDown, ChevronUp, Send, BookOpen, Bot, User } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { State, Action } from './state'
import { apiFetch } from '@api/api'
import ReactMarkdown from 'react-markdown'

const AI_NAME = 'Autolex';

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

interface MarkdownErrorBoundaryState {
  hasError: boolean;
}

interface MarkdownErrorBoundaryProps {
  children: React.ReactNode;
}

class MarkdownErrorBoundary extends React.Component<MarkdownErrorBoundaryProps, MarkdownErrorBoundaryState> {
  constructor(props: MarkdownErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): MarkdownErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500">Error rendering message</div>;
    }

    return this.props.children;
  }
}

const MemoizedMarkdown = React.memo(({ content, className }: { content: string, className?: string }) => (
  <MarkdownErrorBoundary>
    <ReactMarkdown 
      className={`prose dark:prose-invert max-w-none ${className}`}
      components={{
        a: (props) => (
          <a {...props} target="_blank" rel="noopener noreferrer" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </MarkdownErrorBoundary>
));

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ group, toggleFeedback, handleStarClick, submitFeedback, state, dispatch }) => {
  return (
    <div className="mt-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleFeedback(state.chatHistory.findIndex(msg => msg.content === group.content))}
        className="text-xs py-1 h-6 px-2 ml-8 mb-2"
      >
        {group.showFeedback ? (
          <>
            <ChevronUp className="w-3 h-3 mr-1" />
            Hide Feedback
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3 mr-1" />
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
            <Card className="bg-background/50 backdrop-blur-sm ml-8 mb-4">
              <CardContent className="p-3 text-sm">
                <h4 className="text-sm font-medium mb-2">Rate this response</h4>
                <div className="flex justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStarClick(state.chatHistory.findIndex(msg => msg.content === group.content), star)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${
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
                  className="mb-2 text-sm w-full"
                  rows={2}
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
                    size="sm"
                    className="text-xs py-1 px-2 h-7"
                  >
                    {group.feedbackLoading ? (
                      <Settings className="w-3 h-3 animate-spin mr-1" />
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
                      <Alert variant="destructive" className="mt-2 text-xs">
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

const WelcomeMessage = () => (
  <div className="flex items-center space-x-2 mb-4 p-4 bg-muted rounded-lg">
    <BookOpen className="w-6 h-6 text-primary" />
    <div>
      <h2 className="text-lg font-semibold">Welcome to {AI_NAME}</h2>
      <p className="text-sm text-muted-foreground">
        I&apos;m your automotive knowledge assistant. How can I help you today?
      </p>
    </div>
  </div>
);

export default function Component({ state, dispatch }: ChatInterfaceProps) {
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [state.chatHistory])

  useEffect(() => {
    dispatch({ type: 'CLEAR_CHAT_HISTORY' });
    setInputValue('');
    setIsTyping(false);
  }, [state.selectedMake, state.selectedModel, state.selectedYear, dispatch]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    setShowScrollButton(scrollHeight - scrollTop > clientHeight + 100)
  }

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSearch = async () => {
    if (!state.selectedMake || !state.selectedModel || !state.selectedYear || !inputValue.trim()) return;
    
    dispatch({ type: 'SET_LOADING', payload: { search: true } });
    const userMessage = { role: 'user', content: inputValue };
    dispatch({ type: 'SET_CHAT_HISTORY', payload: [...state.chatHistory, userMessage] });
    setIsTyping(true);
    setInputValue('');
    
    try {
      const searchParams = new URLSearchParams({
        make: state.selectedMake,
        model: state.selectedModel,
        year: state.selectedYear,
        query: inputValue,
      });

      const data = await retryFetch(`api/search?${searchParams.toString()}`);

      const gptResponse = data.gpt_response || "I'm sorry, I couldn't generate a response. Please try again.";

      dispatch({ type: 'SET_CHAT_HISTORY', payload: [...state.chatHistory, userMessage, { role: 'assistant', content: gptResponse, showFeedback: false }] });
    } catch (error) {
      console.error('Error performing search', error);
      let errorMessage = 'An error occurred. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: 'SET_CHAT_HISTORY', payload: [...state.chatHistory, userMessage, { role: 'assistant', content: errorMessage, showFeedback: false }] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { search: false } });
      setIsTyping(false);
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
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background w-full max-w-screen-2xl mx-auto px-4 lg:px-8">
      <div className="flex-none p-4 sticky top-0 z-10 bg-background">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            dispatch({ type: 'SET_SHOW_CHAT', payload: false });
            dispatch({ type: 'CLEAR_CHAT_HISTORY' });
          }}
          className="hover:bg-accent hover:text-accent-foreground"
        >
          ← Back
        </Button>
      </div>
      <div className="flex-grow overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-grow overflow-y-auto" onScroll={handleScroll}>
            <div className="w-full mx-auto px-4 py-2 sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[70%] max-w-7xl">
              {state.chatHistory.length === 0 && <WelcomeMessage />}
              <AnimatePresence>
                {groupMessages(state.chatHistory).map((group, groupIndex) => (
                  <motion.div
                    key={groupIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
                    className={`mb-4 ${groupIndex === 0 ? 'mt-4' : ''}`}
                  >
                    {group.map((message, messageIndex) => (
                      <React.Fragment key={messageIndex}>
                        <motion.div
                          initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: messageIndex * 0.1 }}
                          className={`flex items-start mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.role === 'assistant' && (
                            <div className="flex-shrink-0 mr-2">
                              <Bot className="w-8 h-8 text-primary" />
                            </div>
                          )}
                          <div className={`rounded-lg px-3 py-2 max-w-[80%] text-sm leading-relaxed ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <MemoizedMarkdown content={message.content} className="text-sm" />
                          </div>
                          {message.role === 'user' && (
                            <div className="flex-shrink-0 ml-2">
                              <User className="w-8 h-8 text-primary" />
                            </div>
                          )}
                        </motion.div>
                        {message.role === 'assistant' && !message.feedbackSubmitted && (
                          <FeedbackSection
                            group={message}
                            toggleFeedback={toggleFeedback}
                            handleStarClick={handleStarClick}
                            submitFeedback={submitFeedback}
                            state={state}
                            dispatch={dispatch}
                          />
                        )}
                      </React.Fragment>
                    ))}
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
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start justify-start mb-2"
                >
                  <div className="flex-shrink-0 mr-2">
                    <Settings className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <div className="rounded-lg px-3 py-2 bg-muted">
                    <span className="inline-block animate-pulse">{AI_NAME} is thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
          <div className="flex-none bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="w-full mx-auto px-4 py-3 sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[70%] max-w-7xl">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.slice(0, 280))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Type your question here..."
                  disabled={state.loading.search}
                  className="flex-grow text-sm"
                />
                <Button onClick={handleSearch} disabled={!inputValue.trim() || state.loading.search} size="sm" className="h-8 w-8 p-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-right mt-1 text-muted-foreground">
                {inputValue.length}/280
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-4"
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
    </div>
  )
}