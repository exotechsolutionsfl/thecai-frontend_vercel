import { useEffect, useRef, useState, useCallback } from 'react'
import { useTheme } from '@/context/ThemeProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Star, ChevronDown, ChevronUp, Plus, Filter, X, Send } from 'lucide-react'
import { Alert } from "@/components/ui/Alert"
import { Popover } from './popover'
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
  theme: string
  toggleFeedback: (index: number) => void
  handleStarClick: (index: number, rating: number) => void
  submitFeedback: (index: number) => Promise<void>
  state: State
  dispatch: React.Dispatch<Action>
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ group, theme, toggleFeedback, handleStarClick, submitFeedback, state, dispatch }) => {
  return (
    <div className="mt-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => toggleFeedback(state.chatHistory.findIndex(msg => msg.content === group.content))}
        className={`text-sm font-medium ${
          theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'
        }`}
      >
        {group.showFeedback ? (
          <>
            <ChevronUp className="inline-block w-4 h-4 mr-1" />
            Hide Feedback
          </>
        ) : (
          <>
            <ChevronDown className="inline-block w-4 h-4 mr-1" />
            Give Feedback
          </>
        )}
      </motion.button>
      <AnimatePresence>
        {group.showFeedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`mt-2 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}
          >
            <h4 className={`text-lg font-medium mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              Rate this response
            </h4>
            <div className="flex mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => handleStarClick(state.chatHistory.findIndex(msg => msg.content === group.content), star)}
                >
                  <Star
                    className={`w-6 h-6 cursor-pointer ${
                      star <= (group.rating || 0)
                        ? theme === 'dark' ? 'text-yellow-500 fill-yellow-500' : 'text-yellow-400 fill-yellow-400'
                        : theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            <textarea
              placeholder="Additional comments (optional)"
              className={`w-full p-2 rounded-lg mb-4 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white'
                  : 'bg-white text-black'
              } border border-gray-300`}
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
            ></textarea>
            {group.rating && !group.feedbackSubmitted && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => submitFeedback(state.chatHistory.findIndex(msg => msg.content === group.content))}
                disabled={group.feedbackLoading}
                className={`w-full p-2 rounded-lg font-medium transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } ${group.feedbackLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {group.feedbackLoading ? (
                  <Settings className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Submit Feedback'
                )}
              </motion.button>
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
                    {group.feedbackError}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const Component: React.FC<ChatInterfaceProps> = ({ state, dispatch }) => {
  const { theme } = useTheme()
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
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          dispatch({ type: 'SET_SHOW_CHAT', payload: false });
          dispatch({ type: 'CLEAR_CHAT_HISTORY' });
        }}
        className={`mb-4 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-gray-200 text-black hover:bg-gray-300'
        }`}
      >
        ← Back to Selection
      </motion.button>
      <div className="flex-grow overflow-hidden relative">
        <motion.div
          className={`absolute inset-0 overflow-y-auto ${
            theme === 'dark' ? 'bg-[#1a1b1e]' : 'bg-gray-50'
          } mt-4`}
          onScroll={handleScroll}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5}}
        >
          <div className="max-w-5xl mx-auto px-4 py-6">
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
                      <motion.div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : theme === 'dark'
                            ? 'bg-gray-800 text-white'
                            : 'bg-white text-black shadow-md'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        {message.content}
                      </motion.div>
                    </motion.div>
                  ))}
                  {group[0].role === 'assistant' && !group[0].feedbackSubmitted && (
                    <FeedbackSection
                      group={group[0]}
                      theme={theme}
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
                          Thank you for your feedback!
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>
        </motion.div>
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={scrollToBottom}
              className={`fixed bottom-4 right-4 p-2 rounded-full shadow-lg transition-all duration-300 ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-black'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <motion.div
        className={`border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-4 items-center"
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFilters}
                className={`p-2 rounded-full ${
                  theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'
                }`}
                aria-label={showFilters ? "Hide filters" : "Show filters"}
              >
                <motion.div
                  animate={{ rotate: showFilters ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {showFilters ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Popover
                      trigger={
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
                        >
                          <Filter className="w-5 h-5 inline-block mr-2" />
                          {state.selectedMainTopic || 'Select Main Topic'}
                        </motion.button>
                      }
                      content={
                        <div className="w-56 grid gap-4">
                          {state.mainTopics.map((topic) => (
                            <motion.button
                              key={topic}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`text-left px-2 py-1 rounded ${
                                state.selectedMainTopic === topic
                                  ? 'bg-blue-500 text-white'
                                  : theme === 'dark'
                                    ? 'text-white hover:bg-gray-700'
                                    : 'text-black hover:bg-gray-200'
                              }`}
                              onClick={() => handleMainTopicChange(topic)}
                            >
                              {topic}
                            </motion.button>
                          ))}
                        </div>
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {state.selectedMainTopic && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'
                    }`}
                  >
                    {state.selectedMainTopic}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={removeMainTopic}
                      className="ml-2 text-red-500 hover:text-red-600"
                      aria-label="Remove selected topic"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
          <div className="flex space-x-4">
            <div className="flex-grow relative">
              <input
                type="text"
                value={state.query}
                onChange={(e) => dispatch({ type: 'SET_QUERY', payload: e.target.value.slice(0, 280) })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Type your question here..."
                className={`w-full p-3 pr-16 rounded-lg transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-white border-gray-700 focus:bg-gray-750'
                    : 'bg-white text-black border-gray-200 focus:bg-gray-50'
                } border shadow-sm focus:ring-2 focus:ring-blue-500 outline-none`}
                disabled={state.loading.search}
              />
              <span className={`absolute right-3 bottom-3 text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {state.query.length}/280
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={!state.query || state.loading.search}
              className={`px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                theme === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } ${(!state.query || state.loading.search) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {state.loading.search ? (
                <Settings className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Component;