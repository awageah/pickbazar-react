import React from 'react';

/**
 * Kolshi S6 — modal view identifiers.
 *
 * Removed relative to the stock template:
 *   - `REFUND_REQUEST`, `QUESTION_FORM`, `ABUSE_REPORT` (decision log
 *     H.5 / I.2 / I.4 Delete)
 *   - `USE_NEW_PAYMENT`, `ADD_NEW_CARD`, `ADD_NEW_CARD_DURING_PAYMENT`,
 *     `USE_SAVED_CARD`, `DELETE_CARD_MODAL`, `STRIPE_ELEMENT_MODAL`,
 *     `GATEWAY_MODAL` (H.2 Stripe / H.3 Saved cards Delete)
 *   - `ADD_OR_UPDATE_GUEST_ADDRESS` (F.4 guest checkout Delete)
 *   - `NEWSLETTER_MODAL` (N.3 newsletter Delete)
 *   - `LOCATION_BASED_SHOP` (L.8 Google-Maps near-by search Delete)
 */
type MODAL_VIEWS =
  | 'REGISTER'
  | 'LOGIN_VIEW'
  | 'FORGOT_VIEW'
  | 'OTP_LOGIN'
  | 'ADD_OR_UPDATE_ADDRESS'
  | 'ADD_OR_UPDATE_CHECKOUT_CONTACT'
  | 'ADD_OR_UPDATE_PROFILE_CONTACT'
  | 'DELETE_ADDRESS'
  | 'PRODUCT_DETAILS'
  | 'REVIEW_RATING'
  | 'SHOP_INFO'
  | 'SELECT_PRODUCT_VARIATION'
  | 'REVIEW_IMAGE_POPOVER'
  | 'PAYMENT_MODAL'
  | 'PROMO_POPUP_MODAL'
  | 'REVIEW_POPUP_MODAL';

interface State {
  view?: MODAL_VIEWS;
  data?: any;
  isOpen: boolean;
}
type Action =
  | { type: 'open'; view?: MODAL_VIEWS; payload?: any }
  | { type: 'close' };

const initialState: State = {
  view: undefined,
  isOpen: false,
  data: null,
};

function modalReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open':
      return {
        ...state,
        view: action.view,
        data: action.payload,
        isOpen: true,
      };
    case 'close':
      return {
        ...state,
        view: undefined,
        data: null,
        isOpen: false,
      };
    default:
      throw new Error('Unknown Modal Action!');
  }
}

const ModalStateContext = React.createContext<State>(initialState);
ModalStateContext.displayName = 'ModalStateContext';
const ModalActionContext = React.createContext<
  React.Dispatch<Action> | undefined
>(undefined);
ModalActionContext.displayName = 'ModalActionContext';

export const ModalProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = React.useReducer(modalReducer, initialState);
  return (
    <ModalStateContext.Provider value={state}>
      <ModalActionContext.Provider value={dispatch}>
        {children}
      </ModalActionContext.Provider>
    </ModalStateContext.Provider>
  );
};

export function useModalState() {
  const context = React.useContext(ModalStateContext);
  if (context === undefined) {
    throw new Error(`useModalState must be used within a ModalProvider`);
  }
  return context;
}

export function useModalAction() {
  const dispatch = React.useContext(ModalActionContext);
  if (dispatch === undefined) {
    throw new Error(`useModalAction must be used within a ModalProvider`);
  }
  return {
    openModal(view?: MODAL_VIEWS, payload?: unknown) {
      dispatch({ type: 'open', view, payload });
    },
    closeModal() {
      dispatch({ type: 'close' });
    },
  };
}
