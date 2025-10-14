
import { useState, useRef, useCallback } from 'react';

export const useMicrophone = () => {
  const [audioData, setAudioData] = useState(0);
  const [isMicActive, setIsMicActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const processAudio = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (const amplitude of dataArray) {
        sum += Math.pow(amplitude / 128.0 - 1, 2);
      }
      const rms = Math.sqrt(sum / dataArray.length);
      setAudioData(rms * 256); // Scale up for better visualization
    }
    animationFrameRef.current = requestAnimationFrame(processAudio);
  }, []);

  const startMic = useCallback(async () => {
    if (audioContextRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      
      const analyser = context.createAnalyser();
      analyserRef.current = analyser;
      
      const source = context.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      setIsMicActive(true);
      processAudio();

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setIsMicActive(false);
    }
  }, [processAudio]);

  const stopMic = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    streamRef.current?.getTracks().forEach(track => track.stop());
    sourceRef.current?.disconnect();
    audioContextRef.current?.close();

    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    
    setAudioData(0);
    setIsMicActive(false);
  }, []);

  return { audioData, startMic, stopMic, isMicActive };
};
