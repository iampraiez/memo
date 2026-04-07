"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-20 font-sans sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-12 inline-flex items-center text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </Link>

        <h1 className="font-display mb-8 text-4xl font-bold text-neutral-900">Privacy Policy</h1>
        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-600">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">1. Data Collection</h2>
            <p className="leading-relaxed">
              Memory Lane is designed to be a private sanctuary. We collect your email address for
              account management and the memories you explicitly choose to save.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">2. Sharing & Transparency</h2>
            <p className="leading-relaxed">
              Your data is yours. We do not sell your personal information. Memories are private by
              default and only shared if you explicitly choose to use the "Share" features.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">3. Security</h2>
            <p className="leading-relaxed">
              We implement industry-standard security measures to protect your data. However, no
              digital storage is 100% secure, so we encourage using strong passwords.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">4. AI Processing</h2>
            <p className="leading-relaxed">
              If enabled, our AI services process your memory text to provide insights and
              summaries. This data is used solely to enhance your personal experience.
            </p>
          </section>

          <section className="border-t border-neutral-100 pt-8">
            <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
