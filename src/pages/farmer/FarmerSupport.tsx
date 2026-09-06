import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, PhoneCall, Mail, MessageSquare, FileText } from 'lucide-react';

export default function FarmerSupport() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="text-center md:text-left mb-8">
        <h1 className="text-2xl font-black text-slate-900">Help & Support</h1>
        <p className="text-slate-500 text-sm mt-1">Need assistance with your procurement process? We're here to help.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-2xl flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
            <PhoneCall className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Kishan Helpline</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">Toll-free 24/7 support in local languages.</p>
            <p className="text-2xl font-black text-emerald-700 font-mono tracking-tight">1800-180-1551</p>
          </div>
        </Card>

        <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-2xl flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">WhatsApp Support</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">Chat with our AI assistant for quick answers.</p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
              Start WhatsApp Chat
            </Button>
          </div>
        </Card>
      </div>

      <h3 className="font-bold text-slate-900 text-lg mt-8 mb-4">Frequently Asked Questions</h3>
      
      <div className="space-y-3">
        {[
          { q: "How is the MSP calculated?", a: "The Minimum Support Price (MSP) is calculated based on the grade of your produce. Mandi handling charges are deducted before final DBT payout." },
          { q: "What happens if my crop fails the moisture test?", a: "If moisture is above 17%, the produce may be rejected or subject to deductions. You will have to dry it and book a new slot." },
          { q: "When will the money reach my bank account?", a: "Once the e-J-Form is generated at the weighbridge, DBT payout is initiated and typically reflects in your Aadhaar-linked account within 24-48 hours." }
        ].map((faq, i) => (
          <Card key={i} className="p-5 border-slate-200 bg-white shadow-sm rounded-2xl">
            <h4 className="font-bold text-slate-800 text-sm flex items-start gap-2">
              <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              {faq.q}
            </h4>
            <p className="text-xs text-slate-600 mt-2 ml-6 leading-relaxed">{faq.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
