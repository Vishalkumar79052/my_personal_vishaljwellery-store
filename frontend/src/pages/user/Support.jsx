import { useState } from "react";
import {
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  ShieldCheck,
} from "../../components/icons/LucideIcons.jsx";

const faqs = [
  {
    question: "How are Vishal Jewellery Store diamonds and gold certified?",
    answer:
      "Every gold jewel from our maison carries the official Bureau of Indian Standards (BIS) hallmark verifying 18K or 22K purity. All diamonds are independently graded with individual certificates of authenticity from internationally acclaimed gemological laboratories (IGI, GIA, or SGL).",
  },
  {
    question: "How does insured vault delivery work?",
    answer:
      "All acquisitions are packaged in tamper-evident luxury presentation cases and dispatched via specialized, fully-insured armoured courier logistics. Delivery requires a secure one-time verification code (OTP) and signature from the registered patron upon arrival.",
  },
  {
    question: "What is the return and exchange policy?",
    answer:
      "We offer a 15-day complimentary return window for unworn creations accompanied by original tags, security seals, and lab certificates. Additionally, all jewels are backed by our Lifetime Exchange and Buyback guarantee against prevailing gold and diamond benchmarks.",
  },
  {
    question: "Can I request ring resizing or bespoke engraving?",
    answer:
      "Yes. We offer complimentary first-time sizing for all solitaire and eternity rings. Bespoke engravings (monograms, anniversary dates) can be arranged either at checkout or by submitting a concierge request through this portal.",
  },
];

const Support = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("sizing");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
    setSubject("");
    setMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-soft">
        <span className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
          Client Care & Guidance
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
          Bespoke Concierge & Support
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Our master gemologists and personal shopping liaisons are at your disposal for appointments, custom inquiries, and after-sales care.
        </p>
      </div>

      {/* Concierge Contact Cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-900 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-stone-900">Direct Concierge Desk</h3>
            <p className="text-xs text-stone-500 mt-0.5">Mon–Sat, 10:00 AM – 8:00 PM IST</p>
          </div>
          <p className="font-mono text-sm font-bold text-emerald-950">+91 (022) 2854-9900</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-stone-900">High Jewellery Atelier</h3>
            <p className="text-xs text-stone-500 mt-0.5">Response within 4 business hours</p>
          </div>
          <p className="text-xs font-semibold text-stone-800">concierge@vishaljewellery.com</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-900 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-stone-900">Flagship Showroom</h3>
            <p className="text-xs text-stone-500 mt-0.5">Private Salon Viewings by RSVP</p>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">
            Suite 402, High Jewellery Enclave, Bandra West, Mumbai 400050
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Concierge Message Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-soft space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
            <Sparkles className="w-5 h-5 text-amber-700" />
            <h3 className="font-display font-bold text-base text-stone-900">
              Submit a Concierge Request
            </h3>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-700 mx-auto" />
              <h4 className="font-display font-bold text-base text-emerald-950">
                Inquiry Received by Atelier
              </h4>
              <p className="text-xs text-emerald-800 max-w-sm mx-auto leading-relaxed">
                Thank you. A dedicated jewellery specialist has been assigned to your request and will contact you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-bold text-emerald-900 underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Inquiry Purpose</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
                >
                  <option value="sizing">Ring Resizing & Fitting</option>
                  <option value="custom">Bespoke Custom Solitaire Design</option>
                  <option value="order">Order Tracking & Armoured Delivery</option>
                  <option value="certification">Lab Certificate & Appraisal</option>
                  <option value="exchange">Lifetime Exchange & Buyback</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Resizing inquiry for Diamond Solitaire Ring"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Message Details</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your requirements or inquiry in detail…"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-100 font-semibold text-xs transition-colors shadow-xs"
                >
                  Dispatch to Concierge
                </button>
              </div>
            </form>
          )}
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
            <HelpCircle className="w-5 h-5 text-emerald-900" />
            <h3 className="font-display font-bold text-base text-stone-900">
              Frequently Inquired Matters
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-stone-200/80 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 bg-[#FAF9F6] hover:bg-stone-100/60 transition-colors"
                  >
                    <span className="font-display font-bold text-xs text-stone-900">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-stone-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-stone-600 leading-relaxed border-t border-stone-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
