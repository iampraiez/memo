"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-12 inline-flex items-center text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </Link>

        <h1 className="font-display mb-8 text-4xl font-bold text-neutral-900">Terms of Service</h1>
        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-600">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">1. Acceptance of Terms</h2>
            <p>
              By using Memory Lane, you agree to these simple terms. We provide a platform for
              personal legacy preservation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">2. User Conduct</h2>
            <p>
              You are responsible for the content you upload. Please ensure you have the rights to
              any media or text you preserve in your sanctuary.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">3. Termination</h2>
            <p>
              You can delete your account and all associated data at any time through the Settings
              panel. We reserve the right to suspend accounts that violate our community standards.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">4. Disclaimer</h2>
            <p>
              Memory Lane is provided "as is". While we strive for 100% uptime and data integrity,
              we are not liable for accidental data loss. Always keep backups of critical life
              memories.
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
