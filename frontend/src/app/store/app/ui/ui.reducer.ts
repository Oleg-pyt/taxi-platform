import { createReducer, on } from '@ngrx/store';
import { initialUIState } from './ui.state';
import * as UIActions from './ui.actions';

export const uiReducer = createReducer(
  initialUIState,
  on(UIActions.setGlobalLoading, (state, { loading }) => ({
    ...state,
    loading
  })),
  on(UIActions.openModal, (state, { modalType, data }) => ({
    ...state,
    modal: {
      isOpen: true,
      type: modalType,
      data
    }
  })),
  on(UIActions.closeModal, (state) => ({
    ...state,
    modal: {
      isOpen: false,
      type: null
    }
  })),
  on(UIActions.addNotification, (state, { id, message, level }) => ({
    ...state,
    notifications: {
      items: [...state.notifications.items, { id, message, type: level }]
    }
  })),
  on(UIActions.removeNotification, (state, { id }) => ({
    ...state,
    notifications: {
      items: state.notifications.items.filter((item) => item.id !== id)
    }
  }))
);
