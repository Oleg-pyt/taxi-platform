import { createAction, props } from '@ngrx/store';

export const setGlobalLoading = createAction(
  '[UI] Set Global Loading',
  props<{ loading: boolean }>()
);

export const openModal = createAction(
  '[UI] Open Modal',
  props<{ modalType: string; data?: unknown }>()
);

export const closeModal = createAction('[UI] Close Modal');

export const addNotification = createAction(
  '[UI] Add Notification',
  props<{ id: string; message: string; level: 'success' | 'error' | 'info' }>()
);

export const removeNotification = createAction(
  '[UI] Remove Notification',
  props<{ id: string }>()
);
