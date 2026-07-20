import { useEffect } from 'react';

export default function useModalHistory(isOpen, onClose) {
  useEffect(() => {
    if (isOpen) {
      const stateId = Math.random().toString(36).substring(2, 9);
      window.history.pushState({ modalId: stateId }, '');

      const handlePopState = (e) => {
        if (!e.state || e.state.modalId !== stateId) {
          onClose();
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        if (window.history.state && window.history.state.modalId === stateId) {
          window.history.back();
        }
      };
    }
  }, [isOpen, onClose]);
}
