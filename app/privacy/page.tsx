"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 mb-12 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-600">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">1. Data Collection</h2>
            <p className="leading-relaxed">
              Memory Lane is designed to be a private sanctuary. We collect your email address for account management and the memories you explicitly choose to save.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">2. Sharing & Transparency</h2>
            <p className="leading-relaxed">
              Your data is yours. We do not sell your personal information. Memories are private by default and only shared if you explicitly choose to use the "Share" features.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">3. Security</h2>
            <p className="leading-relaxed">
              We implement industry-standard security measures to protect your data. However, no digital storage is 100% secure, so we encourage using strong passwords.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">4. AI Processing</h2>
            <p className="leading-relaxed">
              If enabled, our AI services process your memory text to provide insights and summaries. This data is used solely to enhance your personal experience.
            </p>
          </section>

          <section className="pt-8 border-t border-neutral-100">
            <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
