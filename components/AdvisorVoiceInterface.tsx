
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Headset, MessageSquare, Volume2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { SYSTEM_INSTRUCTION } from '../constants';

const AdvisorVoiceInterface: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<{ role: string; text: string }[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Helper: Base64 Decoding
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Helper: Audio Buffer Decoding
  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  // Helper: Base64 Encoding
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscriptions(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'Advisor') {
                    return [...prev.slice(0, -1), { role: 'Advisor', text: last.text + text }];
                  }
                  return [...prev, { role: 'Advisor', text }];
              });
            } else if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscriptions(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'Sajin') {
                    return [...prev.slice(0, -1), { role: 'Sajin', text: last.text + text }];
                  }
                  return [...prev, { role: 'Sajin', text }];
              });
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Advisor error:', e);
            setError("Communication channel disrupted.");
            stopSession();
          },
          onclose: () => {
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } // Strong, strategic voice
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setError("Failed to establish secure link with HQ.");
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      // In a real scenario, call session.close() if available
    }
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    setIsActive(false);
    setIsConnecting(false);
  };

  return (
    <div className="flex-grow flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Voice Visualizer Area */}
      <div className="flex-1 relative bg-gradient-to-b from-slate-900 to-black p-6 flex flex-col items-center justify-center min-h-[300px]">
        {isActive ? (
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center animate-ping absolute inset-0 opacity-50" />
              <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse absolute inset-0 opacity-75" />
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center relative z-10">
                <Headset className="w-10 h-10 text-indigo-400" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="serif text-2xl text-slate-100 mb-2">Advisor Online</h3>
              <p className="text-slate-500 text-xs uppercase tracking-[0.3em] font-bold">Secure Transmission Active</p>
            </div>
            <div className="flex gap-1 items-end h-8">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-1 bg-indigo-500 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center">
              <MicOff className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <h3 className="serif text-xl text-slate-400">Advisor Dormant</h3>
              <p className="text-slate-600 text-xs mt-1">Initiate voice link for strategic consultation</p>
            </div>
            <button
              onClick={startSession}
              disabled={isConnecting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold text-sm tracking-wide transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>Establishing Link...</>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Request Guidance
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-3">
            <AlertTriangle className="text-red-500 w-4 h-4 shrink-0" />
            <p className="text-xs text-red-400 font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Transcription Area */}
      <div className="h-64 border-t border-slate-800 bg-black/40 p-4 overflow-y-auto space-y-4">
        {transcriptions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-2 opacity-50">
            <MessageSquare className="w-8 h-8" />
            <p className="text-xs font-bold uppercase tracking-widest">Digital Log Empty</p>
          </div>
        ) : (
          transcriptions.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'Sajin' ? 'items-end' : 'items-start'}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1 px-1">
                {msg.role}
              </p>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.role === 'Sajin' 
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-slate-300 rounded-tr-none' 
                  : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Control Footer */}
      {isActive && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-500 uppercase">Live Intel Feed</span>
          </div>
          <button
            onClick={stopSession}
            className="text-xs font-bold text-slate-400 hover:text-red-400 uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <MicOff className="w-3 h-3" />
            Go Dark
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvisorVoiceInterface;
