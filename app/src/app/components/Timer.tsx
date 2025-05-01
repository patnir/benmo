import { useEffect, useState } from 'react';

interface TimerProps {
  endTime: Date;
  onComplete?: () => void;
}

export const Timer = ({ endTime, onComplete }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = endTime.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft('00:00');
        onComplete?.();
        return;
      }

      // Calculate minutes and seconds
      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Format as MM:SS
      setTimeLeft(
        `${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`
      );
    };

    // Update immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    // Cleanup on unmount
    return () => clearInterval(timer);
  }, [endTime, onComplete]);

  return <span>{timeLeft}</span>;
}; 