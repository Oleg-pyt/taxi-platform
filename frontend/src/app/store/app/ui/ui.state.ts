export interface UIState {
  loading: boolean;
  modal: {
    isOpen: boolean;
    type: string | null;
    data?: unknown;
  };
  notifications: {
    items: Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>;
  };
}

export const initialUIState: UIState = {
  loading: false,
  modal: {
    isOpen: false,
    type: null
  },
  notifications: {
    items: []
  }
};
