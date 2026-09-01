import React, { useState, useRef } from 'react';
import {
  Send,
  AlertTriangle,
  Image as ImageIcon,
  Mic,
  Square,
  Upload,
  X,
  FileAudio,
  Radio,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../../../components/ui/modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

interface IncidentIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitText: (reportText: string, coordinates: { lat: number; lng: number }) => Promise<void>;
  onSubmitMedia: (payload: {
    mediaBase64: string;
    mimeType: string;
    callerNote?: string;
    coordinates?: { lat: number; lng: number };
  }) => Promise<void>;
  isLoading?: boolean;
}

export const IncidentIntakeModal: React.FC<IncidentIntakeModalProps> = ({
  isOpen,
  onClose,
  onSubmitText,
  onSubmitMedia,
  isLoading,
}) => {
  const [activeMode, setActiveMode] = useState<'text' | 'image' | 'audio'>('text');
  const [reportText, setReportText] = useState('');
  const [lat, setLat] = useState('12.9716');
  const [lng, setLng] = useState('77.5946');

  // Image state
  const [imageFile, setImageFile] = useState<{ file: File; preview: string; base64: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio recording state
  const [audioFile, setAudioFile] = useState<{ blob: Blob; url: string; base64: string; mimeType: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Handle Image File Selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setImageFile({
        file,
        preview: URL.createObjectURL(file),
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle Audio File Selection
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setAudioFile({
        blob: file,
        url: URL.createObjectURL(file),
        base64,
        mimeType: file.type || 'audio/mp3',
      });
    };
    reader.readAsDataURL(file);
  };

  // Start Live Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          setAudioFile({
            blob: audioBlob,
            url: URL.createObjectURL(audioBlob),
            base64,
            mimeType: 'audio/webm',
          });
        };
        reader.readAsDataURL(audioBlob);

        // Stop tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
    }
  };

  // Stop Live Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleClearMedia = () => {
    setImageFile(null);
    setAudioFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const coordinates = {
      lat: parseFloat(lat) || 12.9716,
      lng: parseFloat(lng) || 77.5946,
    };

    if (imageFile) {
      await onSubmitMedia({
        mediaBase64: imageFile.base64,
        mimeType: imageFile.file.type || 'image/jpeg',
        callerNote: reportText || 'Emergency scene photo attachment',
        coordinates,
      });
    } else if (audioFile) {
      await onSubmitMedia({
        mediaBase64: audioFile.base64,
        mimeType: audioFile.mimeType,
        callerNote: reportText || 'Emergency 911 distress voice recording',
        coordinates,
      });
    } else if (reportText.trim()) {
      await onSubmitText(reportText, coordinates);
    } else {
      return;
    }

    setReportText('');
    handleClearMedia();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Intake New Emergency Incident"
      description="Supports multimodal 911 narrative: text notes, live scene photos, and audio distress recordings."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveMode('text')}
            className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              activeMode === 'text'
                ? 'bg-sky-600 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Radio className="h-3 w-3" />
            <span>Text Note</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('image')}
            className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              activeMode === 'image'
                ? 'bg-sky-600 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="h-3 w-3" />
            <span>Scene Photo {imageFile && '✓'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('audio')}
            className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              activeMode === 'audio'
                ? 'bg-sky-600 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileAudio className="h-3 w-3" />
            <span>Audio 911 {audioFile && '✓'}</span>
          </button>
        </div>

        {/* Narrative Text Input */}
        <div>
          <label className="block text-xs font-mono text-zinc-300 mb-1.5 uppercase">
            {activeMode === 'text'
              ? '911 Caller Narrative / Distress Description:'
              : 'Accompanying Caller Notes / Context (Optional):'}
          </label>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={3}
            placeholder={
              activeMode === 'image'
                ? 'e.g. Photo of structural collapse at warehouse on 4th Main...'
                : activeMode === 'audio'
                ? 'e.g. 911 distress call regarding gas leak on ring road...'
                : 'e.g. Explosion at chemical plant on 8th Cross. Chlorine tank ruptured, 3 workers trapped...'
            }
            className="w-full rounded-md border border-zinc-800 bg-zinc-900/90 p-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
            required={activeMode === 'text'}
          />
        </div>

        {/* Image Attachment Panel */}
        {activeMode === 'image' && (
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center">
            {imageFile ? (
              <div className="relative w-full flex flex-col items-center">
                <img
                  src={imageFile.preview}
                  alt="Incident Scene"
                  className="max-h-36 rounded-md object-cover border border-zinc-700"
                />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-mono text-emerald-400">
                    {imageFile.file.name} ({(imageFile.file.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={handleClearMedia}
                    className="p-1 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-2">
                <ImageIcon className="h-7 w-7 text-sky-400" />
                <div className="text-xs text-zinc-300">
                  <span>Upload emergency scene photo or drone feed</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 text-xs h-7"
                >
                  <Upload className="h-3 w-3" />
                  <span>Choose Image File</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Audio Recording / Upload Panel */}
        {activeMode === 'audio' && (
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center">
            {audioFile ? (
              <div className="w-full flex flex-col items-center gap-2">
                <audio controls src={audioFile.url} className="w-full h-8" />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-emerald-400">
                    Audio Recorded / Uploaded ({audioFile.mimeType})
                  </span>
                  <button
                    type="button"
                    onClick={handleClearMedia}
                    className="p-1 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-2 w-full">
                <div className="flex items-center gap-3">
                  {isRecording ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={stopRecording}
                      className="gap-1.5 h-8 animate-pulse"
                    >
                      <Square className="h-3.5 w-3.5" />
                      <span>Stop Recording ({recordDuration}s)</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={startRecording}
                      className="gap-1.5 h-8 bg-rose-600 hover:bg-rose-500 text-white"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      <span>Record Live Audio</span>
                    </Button>
                  )}

                  <span className="text-zinc-600 text-xs font-mono">OR</span>

                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => audioInputRef.current?.click()}
                    className="gap-1.5 text-xs h-8"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Upload Audio (.mp3, .wav)</span>
                  </Button>
                </div>

                <p className="text-[11px] text-zinc-500 font-mono">
                  Analyzed by Multimodal Gemini 2.0 Flash agent for stress & urgency detection
                </p>
              </div>
            )}
          </div>
        )}

        {/* GPS Coordinates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              LATITUDE:
            </label>
            <Input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="12.9716"
              className="font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              LONGITUDE:
            </label>
            <Input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="77.5946"
              className="font-mono text-xs"
            />
          </div>
        </div>

        {/* Footer info & submit */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
            {imageFile || audioFile ? (
              <>
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-sky-300">Gemini 2.0 Multimodal Analysis</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <span>LangGraph StateGraph &lt; 400ms</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading || (!reportText.trim() && !imageFile && !audioFile)}
              className="gap-1.5 bg-sky-500 hover:bg-sky-400 text-white border-0 shadow-none cursor-pointer"
            >
              <Send className="h-3 w-3" />
              <span>{isLoading ? 'Dispatching...' : 'Dispatch'}</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
