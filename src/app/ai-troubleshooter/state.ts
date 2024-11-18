export type State = {
  makes: string[];
  models: string[];
  years: string[];
  selectedMake: string;
  selectedModel: string;
  selectedYear: string;
  query: string;
  chatHistory: {
    role: string;
    content: string;
    showFeedback?: boolean;
    feedbackSubmitted?: boolean;
    rating?: number;
    comments?: string;
    feedbackLoading?: boolean;
    feedbackError?: string;
    feedbackSuccess?: boolean;
    isStillWorking?: boolean;
  }[];
  loading: {
    makes: boolean;
    models: boolean;
    years: boolean;
    search: boolean;
  };
  showChat: boolean;
  error: string | null;
  mainTopics: string[];
  nestedTopics: { main: string; sub: string }[];
  selectedMainTopic: string;
  selectedNestedTopic: string;
}

export type Action =
  | { type: 'SET_MAKES'; payload: string[] }
  | { type: 'SET_MODELS'; payload: string[] }
  | { type: 'SET_YEARS'; payload: string[] }
  | { type: 'SET_SELECTED_MAKE'; payload: string }
  | { type: 'SET_SELECTED_MODEL'; payload: string }
  | { type: 'SET_SELECTED_YEAR'; payload: string }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_CHAT_HISTORY'; payload: State['chatHistory'] }
  | { type: 'SET_LOADING'; payload: Partial<State['loading']> }
  | { type: 'SET_SHOW_CHAT'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MAIN_TOPICS'; payload: string[] }
  | { type: 'SET_NESTED_TOPICS'; payload: State['nestedTopics'] }
  | { type: 'SET_SELECTED_MAIN_TOPIC'; payload: string }
  | { type: 'SET_SELECTED_NESTED_TOPIC'; payload: string }
  | { type: 'CLEAR_CHAT_HISTORY' }

export const initialState: State = {
  makes: [],
  models: [],
  years: [],
  selectedMake: '',
  selectedModel: '',
  selectedYear: '',
  query: '',
  chatHistory: [],
  loading: {
    makes: true,
    models: false,
    years: false,
    search: false,
  },
  showChat: false,
  error: null,
  mainTopics: [],
  nestedTopics: [],
  selectedMainTopic: '',
  selectedNestedTopic: '',
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_MAKES':
      return { ...state, makes: action.payload }
    case 'SET_MODELS':
      return { ...state, models: action.payload }
    case 'SET_YEARS':
      return { ...state, years: action.payload }
    case 'SET_SELECTED_MAKE':
      return { ...state, selectedMake: action.payload, selectedModel: '', selectedYear: '', chatHistory: [] }
    case 'SET_SELECTED_MODEL':
      return { ...state, selectedModel: action.payload, selectedYear: '', chatHistory: [] }
    case 'SET_SELECTED_YEAR':
      return { ...state, selectedYear: action.payload, chatHistory: [] }
    case 'SET_QUERY':
      return { ...state, query: action.payload }
    case 'SET_CHAT_HISTORY':
      return { ...state, chatHistory: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, ...action.payload } }
    case 'SET_SHOW_CHAT':
      return { ...state, showChat: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_MAIN_TOPICS':
      return { ...state, mainTopics: action.payload }
    case 'SET_NESTED_TOPICS':
      return { ...state, nestedTopics: action.payload }
    case 'SET_SELECTED_MAIN_TOPIC':
      return { ...state, selectedMainTopic: action.payload, selectedNestedTopic: '' }
    case 'SET_SELECTED_NESTED_TOPIC':
      return { ...state, selectedNestedTopic: action.payload }
    case 'CLEAR_CHAT_HISTORY':
      return { ...state, chatHistory: [] }
    default:
      return state
  }
}