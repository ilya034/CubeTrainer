import { useState, useEffect, useRef, useCallback } from 'react';

export const STATUS = {
  IDLE: 'IDLE',       
  HOLDING: 'HOLDING', 
  READY: 'READY',     
  RUNNING: 'RUNNING', 
  FINISHED: 'FINISHED' 
};

export const useTimer = (onFinish) => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [time, setTime] = useState(0);
  
  const timerInterval = useRef(null);
  const holdTimeout = useRef(null);
  const startTime = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.code !== 'Space') return;
    if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement.tagName)) return;
    
    e.preventDefault();

    if (status === STATUS.RUNNING) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
      
      const finalTime = Date.now() - startTime.current;
      setStatus(STATUS.FINISHED);
      setTime(finalTime);
      if (onFinish) onFinish(finalTime);
      return;
    }

    if (status === STATUS.IDLE || status === STATUS.FINISHED) {
      if (status === STATUS.FINISHED) setTime(0);
      setStatus(STATUS.HOLDING);
      
      holdTimeout.current = setTimeout(() => {
        setStatus(STATUS.READY);
      }, 400);
    }
  }, [status, onFinish]);

  const handleKeyUp = useCallback((e) => {
    if (e.code !== 'Space') return;

    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }

    if (status === STATUS.READY) {
      setStatus(STATUS.RUNNING);
      startTime.current = Date.now();
      
      timerInterval.current = setInterval(() => {
        setTime(Date.now() - startTime.current);
      }, 10);
      
    } else if (status === STATUS.HOLDING) {
      setStatus(STATUS.IDLE);
    }
  }, [status]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  return { time, status, setTime, setStatus };
};