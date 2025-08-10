import { useState, useRef } from 'react';
import axios from 'axios';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

export default function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [waveformData, setWaveformData] = useState([]);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());

        const compressed = await compressAudio(blob);
        const wavBlob = new Blob([compressed.buffer], { type: 'audio/mp3' });
        setAudioBlob(wavBlob); // replace original with compressed

        generateWaveform(wavBlob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error('🎙️ Voice recording failed:', error);
    }
  };

  const stop = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const upload = async () => {
    if (!audioBlob) return;

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      const res = await axios.post('/api/voice-messages', formData);
      console.log('✅ Audio uploaded:', res.data);
    } catch (err) {
      console.error('❌ Upload failed:', err);
    }
  };

  const compressAudio = async (blob) => {
    if (!ffmpeg.isLoaded()) await ffmpeg.load();
    ffmpeg.FS('writeFile', 'input.wav', await fetchFile(blob));
    await ffmpeg.run('-i', 'input.wav', '-acodec', 'libmp3lame', 'output.mp3');
    return ffmpeg.FS('readFile', 'output.mp3');
  };

  const generateWaveform = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const rawData = audioBuffer.getChannelData(0); // only first channel
    const samples = 100; // how many bars you want
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData = [];

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[i * blockSize + j]);
      }
      filteredData.push(sum / blockSize);
    }

    setWaveformData(filteredData);
  };

  return {
    recording,
    start,
    stop,
    upload,
    audioBlob,
    waveformData,
  };
}
