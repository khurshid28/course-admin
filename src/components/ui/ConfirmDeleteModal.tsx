import React from 'react';
import { Modal } from './modal';
import Button from '../ui/button/Button';
import { CloseIcon } from '../../icons';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  isLoading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "O'chirishni tasdiqlang",
  message = "Ushbu elementni o'chirmoqchimisiz?",
  itemName,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4">
      <div className="relative w-full p-6 bg-white rounded-3xl dark:bg-gray-900">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <CloseIcon className="size-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-2">
          {title}
        </h3>

        {/* Message */}
        <div className="text-center mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-2">{message}</p>
          {itemName && (
            <p className="text-gray-800 dark:text-white font-medium">
              "{itemName}"
            </p>
          )}
          <p className="text-sm text-red-600 dark:text-red-400 mt-3">
            Bu amalni bekor qilib bo'lmaydi!
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            size="md"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            Bekor qilish
          </Button>
          <Button
            size="md"
            variant="primary"
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[120px] bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isLoading ? "O'chirilmoqda..." : "O'chirish"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
