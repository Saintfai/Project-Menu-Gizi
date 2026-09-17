import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import Button from '../buttons/Button';
import NoteDetailContent from './NoteDetailContent';

export const NoteDetailModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Catatan Pesanan">
      <NoteDetailContent data={data} />
      
      <div className="flex justify-end pt-4 mt-4 border-t border-neutral-100">
        <Button variant="primary" onClick={onClose} className="px-6">Tutup</Button>
      </div>
    </Modal>
  );
};

NoteDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.object,
};

export default NoteDetailModal;
