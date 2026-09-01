import React, { useState } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import { Modal } from '../../../components/ui/modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

interface IncidentIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reportText: string, coordinates: { lat: number; lng: number }) => Promise<void>;
  isLoading?: boolean;
}

export const IncidentIntakeModal: React.FC<IncidentIntakeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [reportText, setReportText] = useState('');
  const [lat, setLat] = useState('12.9716');
  const [lng, setLng] = useState('77.5946');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    await onSubmit(reportText, {
      lat: parseFloat(lat) || 12.9716,
      lng: parseFloat(lng) || 77.5946,
    });
    setReportText('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Intake New Emergency Incident"
      description="Inject raw caller narrative into LangGraph StateGraph engine for autonomous triage & OSRM dispatch."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-zinc-300 mb-1.5 uppercase">
            911 Caller Narrative / Distress Text:
          </label>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={4}
            placeholder="e.g. Explosion at chemical plant on 8th Cross. Chlorine tank ruptured, 3 workers unconscious..."
            className="w-full rounded-md border border-zinc-800 bg-zinc-900/90 p-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
            required
          />
        </div>

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

        <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
          <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            <span>Executes through LangGraph in &lt; 400ms</span>
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
              disabled={isLoading || !reportText.trim()}
              className="gap-1.5"
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
