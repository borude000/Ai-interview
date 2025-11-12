import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const InterviewSessionPage = () => {
  const [location, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [language, setLanguage] = useState<string>(((navigator as any)?.language) || 'en-US');
  const [micMode, setMicMode] = useState<'hold' | 'tap'>((localStorage.getItem('mic_mode') as 'hold'|'tap') || 'hold');
  const [recognizerSupported, setRecognizerSupported] = useState<boolean>(true);
  const [continuous, setContinuous] = useState<boolean>((localStorage.getItem('mic_continuous') || 'off') === 'on');
  const recognitionRef = useRef<any | null>(null);
  const partialRef = useRef<string>('');
  const gotFinalRef = useRef<boolean>(false);
  const manualStoppingRef = useRef<boolean>(false);
  const flushTimeoutRef = useRef<number | null>(null);
  const finalBufferRef = useRef<string>('');
  const [partialText, setPartialText] = useState('');
  const [finalResult, setFinalResult] = useState<{ score: number; top?: string[] } | null>(null);
  // Local Whisper STT via MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const usingRecorderRef = useRef<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Persist language preference
  useEffect(() => {
    const saved = localStorage.getItem('speech_language');
    if (saved) setLanguage(saved);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    // Defer to allow DOM to paint
    const id = window.setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
    return () => window.clearTimeout(id);
  }, [messages]);
  useEffect(() => {
    if (language) localStorage.setItem('speech_language', language);
    // If recognizer exists, update its language
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  // Persist mic mode
  useEffect(() => {
    localStorage.setItem('mic_mode', micMode);
  }, [micMode]);

  // Persist continuous session
  useEffect(() => {
    localStorage.setItem('mic_continuous', continuous ? 'on' : 'off');
  }, [continuous]);

  // Push-to-talk with Space key (when input is not focused)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const el = document.activeElement as HTMLElement | null;
        const isTyping = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
        if (!isTyping && !isListening) {
          e.preventDefault();
          startHoldToTalk();
        }
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const el = document.activeElement as HTMLElement | null;
        const isTyping = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
        if (!isTyping) {
          e.preventDefault();
          stopHoldToTalk();
        }
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [isListening]);

  // Basic punctuation/capitalization heuristics
  const formatUtterance = (t: string) => {
    let s = t.trim().replace(/\s+/g, ' ');
    if (!s) return s;
    s = s.charAt(0).toUpperCase() + s.slice(1);
    if (!/[.!?]$/.test(s)) s += '.';
    return s;
  };

  useEffect(() => {
    const params = new URLSearchParams(String(location.search));
    const type = params.get('type');
    const role = params.get('role');
    const techs = params.get('techs');
    const difficulty = params.get('difficulty') || 'beginner';

    const startInterview = async () => {
      try {
        const response = await fetch('/api/interview/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}),
          },
          body: JSON.stringify({ type, role, difficulty, techs: techs ? techs.split(',') : [] }),
        });

        if (!response.ok) {
          throw new Error('Failed to start interview');
        }

        const data = await response.json();
        setMessages([{ sender: 'ai', text: data.question }]);
        setCurrentQuestionId(data.id || null);
        if (data.interviewId) setInterviewId(String(data.interviewId));
        setFinalResult(null);
        // Auto-start listening if continuous session is on
        if (continuous && !isListening) {
          startHoldToTalk();
        }
      } catch (error) {
        console.error('Error starting interview:', error);
        setMessages([
          {
            sender: 'ai',
            text: 'Sorry, I encountered an error starting the interview. Please try again.',
          },
        ]);
      }
    };

    startInterview();
  }, [location.search]);

  // Text-to-Speech for latest AI message
  useEffect(() => {
    if (!ttsEnabled) return;
    const last = messages[messages.length - 1];
    if (last && last.sender === 'ai' && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(last.text);
      utter.rate = 1.0;
      utter.pitch = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  }, [messages, ttsEnabled]);

  const handleSendMessage = async (overrideText?: string) => {
    const textToSend = (overrideText ?? input).trim();
    if (textToSend) {
      const newMessages: Message[] = [...messages, { sender: 'user', text: textToSend }];
      setMessages(newMessages);
      if (!overrideText) setInput('');

      try {
        const response = await fetch('/api/interview/next', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}),
          },
          body: JSON.stringify({ messages: newMessages, context: new URLSearchParams(String(location.search)).toString(), afterId: currentQuestionId, retryCount, interviewId }),
        });

        if (!response.ok) {
          throw new Error('Failed to get next question');
        }

        const data = await response.json();
        // If server indicates interview done
        if (data.done) {
          setMessages([...newMessages, { sender: 'ai', text: data.message || 'Interview complete.' }]);
          setCurrentQuestionId(null);
          setRetryCount(0);
          setFinalResult({ score: typeof data.score === 'number' ? data.score : 0, top: Array.isArray(data.matchedTop) ? data.matchedTop : undefined });
          // ensure mic is stopped
          if (isListening) {
            stopHoldToTalk(undefined as any);
          }
          return;
        }
        // If server asks to repeat the same question (feedback included in question text)
        if (data.repeat && data.id === currentQuestionId) {
          setMessages([...newMessages, { sender: 'ai', text: data.question }]);
          setRetryCount((c) => c + 1);
          // In continuous mode, continue listening automatically
          if (continuous && !isListening) {
            startHoldToTalk();
          }
          return;
        }
        // Normal next question
        setMessages([...newMessages, { sender: 'ai', text: data.question }]);
        setCurrentQuestionId(data.id || null);
        setRetryCount(0);
        // Auto-start listening if continuous session is on
        if (continuous && !isListening) {
          startHoldToTalk();
        }
      } catch (error) {
        console.error('Error getting next question:', error);
        setMessages([
          ...newMessages,
          {
            sender: 'ai',
            text: 'Sorry, I encountered an error. Please try again.',
          },
        ]);
      }
    }
  };

  // Speech Recognition Hold-to-Talk
  const ensureRecognizer = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognizerSupported(false);
      return null;
    }
    setRecognizerSupported(true);
    const rec = new SpeechRecognition();
    rec.lang = language || 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    // Allow longer utterances; we'll stop manually on button release
    (rec as any).continuous = true;
    rec.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalTranscript += res[0].transcript;
        } else {
          partialRef.current = res[0].transcript;
          setPartialText(partialRef.current);
        }
      }
      if (finalTranscript.trim()) {
        gotFinalRef.current = true;
        // accumulate finals during this hold window
        finalBufferRef.current = (finalBufferRef.current + ' ' + finalTranscript.trim()).trim();
        // do not send yet; wait until manual stop so user can keep talking
        setPartialText('');
        // Cancel any pending flush timers since we received finals
        if (flushTimeoutRef.current) {
          window.clearTimeout(flushTimeoutRef.current);
          flushTimeoutRef.current = null;
        }
      }
    };
    rec.onstart = () => {
      setIsListening(true);
    };
    (rec as any).onnomatch = () => {
      setIsListening(false);
    };
    rec.onerror = (evt: any) => {
      // Permission denied or no-speech are common
      console.warn('Speech recognition error', evt?.error);
      setIsListening(false);
    };
    rec.onend = () => {
      // Auto-restart for continuous session or tap mode unless we manually stopped
      if (((micMode === 'tap') || continuous) && !manualStoppingRef.current) {
        try { rec.start(); return; } catch { /* ignore */ }
      }
      // In hold mode (or after manual stop in tap mode), flush any pending partials
      setIsListening(false);
      if (manualStoppingRef.current) {
        manualStoppingRef.current = false;
        if (!gotFinalRef.current) {
          if (flushTimeoutRef.current) {
            window.clearTimeout(flushTimeoutRef.current);
          }
          flushTimeoutRef.current = window.setTimeout(() => {
            const combined = (finalBufferRef.current + ' ' + partialRef.current).trim();
            if (combined) {
              partialRef.current = '';
              finalBufferRef.current = '';
              handleSendMessage(formatUtterance(combined));
            }
            flushTimeoutRef.current = null;
          }, 250);
        }
        if (gotFinalRef.current) {
          const combined = (finalBufferRef.current + ' ' + partialRef.current).trim();
          if (combined) {
            partialRef.current = '';
            finalBufferRef.current = '';
            handleSendMessage(formatUtterance(combined));
          }
        }
        gotFinalRef.current = false;
        setPartialText('');
      }
    };
    recognitionRef.current = rec;
    return rec;
  };

  const startHoldToTalk = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    try {
      window.speechSynthesis?.cancel();
      // Start MediaRecorder for local Whisper STT
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true },
        } as MediaTrackConstraints,
        video: false,
      });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream as MediaStream);
      chunksRef.current = [];
      recorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstart = () => {
        setIsListening(true);
        setPartialText('');
      };
      recorder.onstop = async () => {
        try {
          setIsListening(false);
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          chunksRef.current = [];
          usingRecorderRef.current = false;
          // stop tracks
          mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;

          // Upload to local Whisper STT
          const fd = new FormData();
          fd.append('audio', blob, 'speech.webm');
          const resp = await fetch('/api/stt', { method: 'POST', body: fd });
          if (!resp.ok) {
            throw new Error('Transcription failed');
          }
          const data = await resp.json();
          const text: string = data.text || '';
          if (text.trim()) {
            await handleSendMessage(text.trim());
          } else if (partialText.trim()) {
            await handleSendMessage(partialText.trim());
          }
          // Continuous session: auto-start again after sending
          if (continuous && micMode === 'tap') {
            startHoldToTalk();
          }
        } catch (err) {
          console.error('Local STT upload/transcribe error:', err);
          setMessages((prev) => ([...prev, { sender: 'ai', text: 'Sorry, I could not understand the audio. Please try again.' }]));
        }
      };
      mediaRecorderRef.current = recorder;
      usingRecorderRef.current = true;
      recorder.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopHoldToTalk = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    // Stop MediaRecorder
    if (usingRecorderRef.current && mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        setIsListening(false);
      }
      return;
    }
  };

  // Tap-to-speak toggling
  const toggleTapToSpeak = async () => {
    if (!recognizerSupported) return;
    if (!isListening) {
      await startHoldToTalk(); // reuse start logic
    } else {
      stopHoldToTalk(undefined as any);
    }
  };

  // Stop interview early
  const stopInterview = async () => {
    try {
      // stop mic if active
      if (isListening) stopHoldToTalk(undefined as any);
      const response = await fetch('/api/interview/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}) },
        body: JSON.stringify({
          messages,
          context: new URLSearchParams(String(location.search)).toString(),
          interviewId,
        }),
      });
      if (!response.ok) throw new Error('Failed to stop interview');
      const data = await response.json();
      if (data.done) {
        setMessages((prev) => ([...prev, { sender: 'ai', text: data.message || 'Interview stopped.' }]));
        setCurrentQuestionId(null);
        setRetryCount(0);
        setFinalResult({ score: typeof data.score === 'number' ? data.score : 0, top: Array.isArray(data.matchedTop) ? data.matchedTop : undefined });
      }
    } catch (e) {
      setMessages((prev) => ([...prev, { sender: 'ai', text: 'Failed to stop interview. Please try again.' }]));
    }
  };

  // Safety stop if user releases outside the button
  useEffect(() => {
    const up = () => stopHoldToTalk();
    document.addEventListener('mouseup', up);
    document.addEventListener('touchend', up);
    return () => {
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchend', up);
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="rounded-2xl shadow-lg h-[70vh] flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>Interview Session</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4 border rounded-lg mb-3 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`px-4 py-2 rounded-lg max-w-xs lg:max-w-md break-words whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
          {/* Prominent live partial transcription when listening */}
          {isListening && partialText && (
            <div className="mb-3 px-3 py-2 rounded-md bg-muted text-sm italic border">
              {partialText}
            </div>
          )}
          {/* Final results card */}
          {finalResult && (
            <div className="mb-3 p-4 border rounded-xl bg-card shadow-sm">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-sm text-muted-foreground">Final Score</span>
                <span className="text-3xl font-bold">{finalResult.score}/100</span>
              </div>
              {finalResult.top && finalResult.top.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm text-muted-foreground mb-1">Top topics you covered</div>
                  <div className="flex flex-wrap gap-2">
                    {finalResult.top.map((t, i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-muted text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => setLocation('/interview/new?type=technical')}>
                  Start Technical Round
                </Button>
                <Button variant="outline" onClick={() => setLocation('/interview/new?type=hr')}>
                  Restart HR Round
                </Button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Language selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              title="Recognition language"
            >
              <option value="en-IN">English (India)</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="en-AU">English (Australia)</option>
              <option value="hi-IN">Hindi (India)</option>
              <option value="ta-IN">Tamil (India)</option>
              <option value="te-IN">Telugu (India)</option>
              <option value="mr-IN">Marathi (India)</option>
              <option value="bn-IN">Bengali (India)</option>
            </select>

            {/* Mic mode */}
            <select
              value={micMode}
              onChange={(e) => setMicMode(e.target.value as 'hold'|'tap')}
              className="border rounded px-2 py-1 text-sm"
              title="Mic mode"
            >
              <option value="hold">Hold to talk</option>
              <option value="tap">Tap to speak</option>
            </select>

            {/* Mic controls: hide entirely if unsupported */}
            {recognizerSupported && (
              <>
                <Button
                  type="button"
                  variant={isListening ? 'default' : 'outline'}
                  {...(micMode === 'hold'
                    ? { onMouseDown: startHoldToTalk, onMouseUp: stopHoldToTalk, onMouseLeave: stopHoldToTalk, onTouchStart: startHoldToTalk, onTouchEnd: stopHoldToTalk, onTouchCancel: stopHoldToTalk }
                    : { onClick: toggleTapToSpeak })}
                  className="shrink-0"
                  title={micMode === 'hold' ? 'Hold to talk' : (isListening ? 'Tap to stop' : 'Tap to speak')}
                >
                  {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                <span className="text-xs text-muted-foreground w-36">
                  {isListening ? (micMode === 'tap' ? 'Listening… (tap to stop)' : 'Listening…') : (micMode === 'tap' ? 'Tap to speak' : 'Hold mic to speak')}
                </span>
              </>
            )}
            {!recognizerSupported && (
              <span className="text-xs text-muted-foreground">Speech recognition not supported in this browser. Please type your answer.</span>
            )}

            <Input
              value={isListening ? partialText : input}
              readOnly={isListening}
              onChange={(e) => { if (!isListening) setInput(e.target.value); }}
              placeholder={isListening ? 'Listening…' : 'Type your answer...'}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              ref={inputRef}
            />

            <Button onClick={() => setTtsEnabled((v) => !v)} variant={ttsEnabled ? 'default' : 'outline'} className="shrink-0" title="Toggle voice output">
              <Volume2 className="h-4 w-4" />
            </Button>

            <Button onClick={stopInterview} variant="destructive" className="shrink-0" title="Stop interview and show result">
              Stop Interview
            </Button>

            <Button onClick={() => handleSendMessage()} className="shrink-0">Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InterviewSessionPage;
