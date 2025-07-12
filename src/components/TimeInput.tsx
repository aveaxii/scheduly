import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TimeInput({ value, onChange, className = '' }: TimeInputProps) {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h || '');
      setMinutes(m || '');
    }
  }, [value]);

  // Update parent when inputs change
  useEffect(() => {
    if (hours && minutes) {
      onChange(`${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`);
    } else if (!hours && !minutes) {
      onChange('');
    }
  }, [hours, minutes, onChange]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 23)) {
      setHours(val);
      // Auto-focus minutes when hours are complete
      if (val.length === 2) {
        minutesRef.current?.focus();
      }
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
      setMinutes(val);
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