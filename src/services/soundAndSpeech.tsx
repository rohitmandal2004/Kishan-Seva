/**
 * Sound, Speech, and Transport Share Utilities for Kishan Seva
 * Works 100% offline using standard browser Web Audio and Web Speech APIs.
 */
import { toast } from 'sonner';
import React from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * Play a pleasant two-tone Mandi electronic chime via synthetic AudioContext
 */
export function playMandiChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.4);

    // Tone 2 (Harmonic major third)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.65);
  } catch (err) {
    console.warn('[Kishan Seva Audio] Web Audio not allowed or unavailable:', err);
  }
}

/**
 * Speak queue or stage announcements aloud using native Web Speech Synthesis API
 */
export function speakAnnouncement(text: string, language: 'en' | 'hi' | 'bn' = 'en') {
  try {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // slightly slower for high clarity in noisy mandi yards
    utterance.pitch = 1.0;

    const langCode = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-IN';
    utterance.lang = langCode;

    // Pick a matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(langCode) || v.lang.startsWith(language));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[Kishan Seva Speech] Speech synthesis error:', err);
  }
}

/**
 * Generates a pre-formatted WhatsApp share link for the tractor/truck transport driver
 */
export function generateWhatsAppShareUrl(params: {
  tokenNumber: string;
  centreName: string;
  slotDate: string;
  slotTime: string;
  cropName: string;
  quantityQ: number;
  vehicleNumber?: string;
}): string {
  const message = `🌾 *Kishan Seva — Official Mandi Delivery Pass*
  
🎫 *Token Number:* ${params.tokenNumber}
📍 *Procurement Centre:* ${params.centreName} (Gate 1)
📅 *Scheduled Date:* ${params.slotDate}
⏰ *Time Window:* ${params.slotTime}
🚛 *Vehicle:* ${params.vehicleNumber || 'Tractor / Trolley'}
🌱 *Produce:* ${params.cropName} (${params.quantityQ} Quintals)

📌 *Driver Instructions:*
Please show this message or token pass at the entry gate security counter for electronic weighbridge entry.

🗺️ *Mandi Location:* https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(params.centreName)}`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Triggers a mock WhatsApp-style notification using Sonner
 */
export function triggerWhatsAppNotification(message: string, delayMs = 1500) {
  setTimeout(() => {
    toast.custom((t) => (
      <div className="flex items-start gap-3 bg-[#075E54] text-white p-4 rounded-2xl shadow-xl w-[320px] pointer-events-auto cursor-pointer" onClick={() => toast.dismiss(t)}>
        <div className="bg-[#25D366] p-2 rounded-full mt-0.5">
          <MessageCircle className="w-5 h-5 text-white fill-white" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <p className="font-bold text-sm text-[#E0F2F1]">Kishan Seva (Govt of WB)</p>
            <p className="text-[10px] text-emerald-200">Just now</p>
          </div>
          <p className="text-xs text-white/90 leading-snug">{message}</p>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center'
    });
    
    // Play a gentle notification sound
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch(e) {}
  }, delayMs);
}
