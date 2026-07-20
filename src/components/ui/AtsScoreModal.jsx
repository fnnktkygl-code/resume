import React from 'react';
import AtsScore from '../AtsScore';
import Modal from './Modal';
import { useTranslation } from '../../utils/TranslationContext';

export default function AtsScoreModal({ isOpen, onClose, data, dispatch, onTriggerAction }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`🎯 ${t('ATS Score & Analysis')}`}
    >
      <div style={{ padding: '0 8px 16px 8px' }}>
        <AtsScore data={data} dispatch={dispatch} onTriggerAction={onTriggerAction} />
      </div>
    </Modal>
  );
}
