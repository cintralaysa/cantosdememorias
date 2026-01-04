"use client";

import { useEffect } from 'react';
import SimpleBookingForm from './SimpleBookingForm';
import { Service } from '@/lib/data';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
}

export default function CheckoutModal({ isOpen, onClose, service }: CheckoutModalProps) {
  // Bloquear scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg animate-fadeInUp">
        <SimpleBookingForm
          service={service}
          onClose={onClose}
          isModal={true}
        />
      </div>
    </div>
  );
}
