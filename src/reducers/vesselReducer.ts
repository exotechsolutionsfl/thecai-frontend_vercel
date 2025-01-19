type State = {
  isSettingsOpen: boolean;
  activeSection: 'main' | 'myVehicles' | 'feedback';
  feedbackType: string;
  feedback: string;
  isSubmitting: boolean;
  showResultModal: boolean;
  resultMessage: string;
  isSuccess: boolean;
};

type Action =
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_ACTIVE_SECTION'; payload: State['activeSection'] }
  | { type: 'SET_FEEDBACK_TYPE'; payload: string }
  | { type: 'SET_FEEDBACK'; payload: string }
  | { type: 'SET_IS_SUBMITTING'; payload: boolean }
  | { type: 'SET_SHOW_RESULT_MODAL'; payload: boolean }
  | { type: 'SET_RESULT'; payload: { message: string; isSuccess: boolean } }
  | { type: 'RESET_FEEDBACK' };

export const initialState: State = {
  isSettingsOpen: false,
  activeSection: 'main',
  feedbackType: 'issue',
  feedback: '',
  isSubmitting: false,
  showResultModal: false,
  resultMessage: '',
  isSuccess: false,
};

export function vesselReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TOGGLE_SETTINGS':
      return { ...state, isSettingsOpen: !state.isSettingsOpen };
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };
    case 'SET_FEEDBACK_TYPE':
      return { ...state, feedbackType: action.payload };
    case 'SET_FEEDBACK':
      return { ...state, feedback: action.payload };
    case 'SET_IS_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'SET_SHOW_RESULT_MODAL':
      return { ...state, showResultModal: action.payload };
    case 'SET_RESULT':
      return {
        ...state,
        resultMessage: action.payload.message,
        isSuccess: action.payload.isSuccess,
      };
    case 'RESET_FEEDBACK':
      return {
        ...state,
        feedbackType: 'issue',
        feedback: '',
      };
    default:
      return state;
  }
}