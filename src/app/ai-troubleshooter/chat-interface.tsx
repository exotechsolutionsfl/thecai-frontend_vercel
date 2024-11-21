'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Star, ChevronDown, ChevronUp, Plus, Filter, X, Send } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { State, Action } from './state'
import { apiFetch } from '@api/api'

const useTopicSelection = (state: State, dispatch: React.Dispatch<Action>) => {
  const fetchMainTopics = useCallback(async () => {
    try {
      const data = await apiFetch(`api/main-topics?make=${encodeURIComponent(state.selectedMake)}&model=${encodeURIComponent(state.selectedModel)}&year=${encodeURIComponent(state.selectedYear)}`)
      if (data && data.main_topic) {
        dispatch({ type: 'SET_MAIN_TOPICS', payload: data.main_topic })
      } else {
        dispatch({ type: 'SET_MAIN_TOPICS', payload: [] })
      }
    } catch (error) {
      console.error("Error fetching main topics:", error)
      dispatch({ type: 'SET_MAIN_TOPICS', payload: [] })
    }
  }, [state.selectedMake, state.selectedModel, state.selectedYear, dispatch])

  useEffect(() => {
    fetchMainTopics()
  }, [fetchMainTopics])

  return { fetchMainTopics }
}

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

const ChatInterface: React.FC<ChatInterfaceProps> = ({ state, dispatch }) => {
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useTopicSelection(state, dispatch)

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
    const tempQuery = state.query;
    dispatch({ type: 'SET_QUERY', payload: '' });

    // Show "Still working" message after 10 seconds.
    const stillWorkingTimeout = setTimeout(() => {
      dispatch({ type: 'SET_CHAT_HISTORY', payload: [...state.chatHistory, userMessage, { role: 'system', content: "Still working on it...", isStillWorking: true }] });
    }, 10000);

    try {
      const searchParams = new URLSearchParams({
        make: state.selectedMake,
        model: state.selectedModel,
        year: state.selectedYear,
        query: tempQuery,
      });

      if (state.selectedMainTopic) {
        searchParams.append('main_topic', state.selectedMainTopic);
      }

      const data = await retryFetch(
        `api/search?${searchParams.toString()}`,
        {},
        3
      );

      clearTimeout(stillWorkingTimeout);
      const gptResponse = data.gpt_response || "I'm sorry, I couldn't generate a response. Please try again.";

      dispatch({ type: 'SET_CHAT_HISTORY', payload: [...state.chatHistory, userMessage, { role: 'assistant', content: gptResponse, showFeedback: false }] });
    } catch (error) {
      clearTimeout(stillWorkingTimeout);
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

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const handleMainTopicChange = (topic: string) => {
    dispatch({ type: 'SET_SELECTED_MAIN_TOPIC', payload: topic })
    setShowFilters(false)
  }

  const removeMainTopic = () => {
    dispatch({ type: 'SET_SELECTED_MAIN_TOPIC', payload: '' })
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
                className="mb-6"
              >
                {group.map((message, messageIndex) => (
                  <motion.div
                    key={messageIndex}
                    initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: messageIndex * 0.1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.content}
                    </div>
                  </motion.div>
                ))}
                {group[0].role === 'assistant' && !group[0].feedbackSubmitted && <FeedbackSection
                    group={group[0]}
                    toggleFeedback={toggleFeedback}
                    handleStarClick={handleStarClick}
                    submitFeedback={submitFeedback}
                    state={state}
                    dispatch={dispatch}
                  />
                }
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
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-4 items-center"
          >
            <Button size="icon" variant="outline" onClick={toggleFilters} aria-label={showFilters ? "Hide filters" : "Show filters"}>
              <AnimatePresence mode="wait">
                {showFilters ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="filter"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        {state.selectedMainTopic || 'Select Main Topic'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56">
                      <div className="grid gap-4">
                        {state.mainTopics.map((topic) => (
                          <Button
                            key={topic}
                            variant={state.selectedMainTopic === topic ? "default" : "ghost"}
                            className="justify-start"
                            onClick={() => handleMainTopicChange(topic)}
                          >
                            {topic}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {state.selectedMainTopic && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button variant="secondary" className="gap-2">
                    {state.selectedMainTopic}
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" onClick={removeMainTopic} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
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

export default ChatInterface;