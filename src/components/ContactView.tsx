import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, CheckCircle, Send, Loader2, AlertCircle } from 'lucide-react';
import { clientAPI } from '../api';

export default function ContactView() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'Bespoke Fitting',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await clientAPI.submitContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        type: formData.type,
        message: formData.message.trim()
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setError(err.message || 'Failed to submit your inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white min-h-screen py-16 font-sans border-t border-[#eeeeee]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">CONNECT US</span>
          <h1 className="text-3xl sm:text-5xl font-display font-light lowercase italic tracking-[0.05em] text-[#111111]">
            book inquiries
          </h1>
          <div className="w-12 h-[1px] bg-neutral-300 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2 space-y-10 bg-neutral-50 p-8 border border-[#eeeeee]">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-[#111111]">Style Studio</h3>
              <p className="text-xs text-neutral-500 leading-relaxed tracking-wider uppercase">
                Visit our physical studio for private fabric curation and hand-tailored bespoke fittings.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="w-4 h-4 text-neutral-800 mt-0.5 shrink-0 stroke-[1.2]" />
                <div className="text-xs space-y-1 tracking-wider text-neutral-600">
                  <p className="font-bold text-neutral-900 uppercase">Address</p>
                  <p>G-12, First Floor</p>
                  <p>City Center, Surat</p>
                  <p>Gujarat -395007</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="w-4 h-4 text-neutral-800 mt-0.5 shrink-0 stroke-[1.2]" />
                <div className="text-xs space-y-1 tracking-wider text-neutral-600">
                  <p className="font-bold text-neutral-900 uppercase">Email Inquiries</p>
                  <p className="hover:text-black transition-colors">styleclothing@gmail.com</p>
                  <p className="hover:text-black transition-colors">sc@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="w-4 h-4 text-neutral-800 mt-0.5 shrink-0 stroke-[1.2]" />
                <div className="text-xs space-y-1 tracking-wider text-neutral-600">
                  <p className="font-bold text-neutral-900 uppercase">Direct Booking</p>
                  <p>+91 12345 09876</p>
                  <p className="text-[10px] text-neutral-400">Mon - Fri: 10AM — 6PM</p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#eeeeee] pt-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Bespoke Fitting Advice</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Fittings require a scheduled reservation. Online inquiries are typically reviewed within 24 business hours by an active draper.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="contact-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {error && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={submitting}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-white border border-[#eeeeee] focus:border-neutral-900 focus:outline-none text-xs rounded-none tracking-wider transition-colors placeholder-neutral-300 disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        disabled={submitting}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-white border border-[#eeeeee] focus:border-neutral-900 focus:outline-none text-xs rounded-none tracking-wider transition-colors placeholder-neutral-300 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                      Inquiry Department
                    </label>
                    <select
                      disabled={submitting}
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-[#eeeeee] focus:border-neutral-900 focus:outline-none text-xs rounded-none tracking-wider transition-colors disabled:opacity-50"
                    >
                      <option>Bespoke Fitting</option>
                      <option>Order Curation Support</option>
                      <option>Brand Collaboration</option>
                      <option>Fabric & Sourcing</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                      Message / Requirement Details *
                    </label>
                    <textarea
                      required
                      rows={5}
                      disabled={submitting}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please specify custom sizing details or fitting preferences..."
                      className="w-full px-4 py-3 bg-white border border-[#eeeeee] focus:border-neutral-900 focus:outline-none text-xs rounded-none tracking-wider transition-colors placeholder-neutral-300 resize-none disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#111111] hover:bg-neutral-800 disabled:bg-neutral-600 text-white font-sans text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2.5 rounded-none cursor-pointer disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin stroke-[1.5]" />
                        <span>Submitting to Atelier...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>Send Inquiry</span>
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-16 bg-neutral-50 border border-[#eeeeee] space-y-4"
                >
                  <CheckCircle className="w-12 h-12 text-[#111111] mx-auto stroke-[1.2]" />
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Inquiry Received Successfully</h3>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed tracking-wider">
                      Thank you for contacting the StyleClothing . Your inquiry has been logged and saved in our database. A custom representative from department <strong>"{formData.type}"</strong> will reach out to you shortly.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setError(null);
                      setFormData({ name: '', email: '', type: 'Bespoke Fitting', message: '' });
                    }}
                    className="mt-4 px-6 py-2.5 bg-[#111111] text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

