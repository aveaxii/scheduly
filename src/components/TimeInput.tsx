import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TimeInputProps {
  onChange: (value: string) => void;
  className?: string;
}

export function TimeInput({ onChange, className = '' }: TimeInputProps) {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);

  const updateParent = (newHours: string, newMinutes: string) => {
    if (newHours && newMinutes) {
      // Only format with leading zeros when sending to parent
      const formattedHours = newHours.padStart(2, '0');
      const formattedMinutes = newMinutes.padStart(2, '0');
      onChange(`${formattedHours}:${formattedMinutes}`);
    } else {
      onChange('');
    }
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    
    if (val === '') {
      setHours('');
      updateParent('', minutes);
    } else {
      const numVal = parseInt(val);
      if (numVal >= 0 && numVal <= 23) {
        setHours(val); // Keep exactly what user typed
        updateParent(val, minutes);
        
        // Auto-focus minutes when hours are complete (2 digits)
        if (val.length === 2) {
          minutesRef.current?.focus();
        }
      }
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    
    if (val === '') {
      setMinutes('');
      updateParent(hours, '');
    } else {
      const numVal = parseInt(val);
      if (numVal >= 0 && numVal <= 59) {
        setMinutes(val); // Keep exactly what user typed
        updateParent(hours, val);
      }
    }
  };

  const handleHoursKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ':') {
      e.preventDefault();
      minutesRef.current?.focus();
    }
  };

  const handleMinutesKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && minutes === '') {
      e.preventDefault();
      hoursRef.current?.focus();
    }
  };

  const handleHoursFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleMinutesFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <motion.input
        ref={hoursRef}
        type="text"
        value={hours}
        onChange={handleHoursChange}
        onKeyDown={handleHoursKeyDown}
        onFocus={handleHoursFocus}
        placeholder="HH"
        maxLength={2}
        className="w-20 h-16 text-center text-4xl font-mono border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/20 transition-all duration-300"
        whileFocus={{ 
          scale: 1.05,
          boxShadow: "0 0 0 4px rgba(0, 0, 0, 0.1)"
        }}
        whileHover={{ 
          borderColor: "#6b7280" 
        }}
      />
      
      <motion.span 
        className="text-4xl font-mono text-gray-400 select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        :
      </motion.span>
      
      <motion.input
        ref={minutesRef}
        type="text"
        value={minutes}
        onChange={handleMinutesChange}
        onKeyDown={handleMinutesKeyDown}
        onFocus={handleMinutesFocus}
        placeholder="MM"
        maxLength={2}
        className="w-20 h-16 text-center text-4xl font-mono border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/20 transition-all duration-300"
        whileFocus={{ 
          scale: 1.05,
          boxShadow: "0 0 0 4px rgba(0, 0, 0, 0.1)"
        }}
        whileHover={{ 
          borderColor: "#6b7280" 
        }}
      />
    </motion.div>
  );
}