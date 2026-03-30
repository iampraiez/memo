import React, { useState } from "react";
import { Share, Users, Mail, Link, Copy, Check } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { Memory } from "@/types/types";
import { stripHtml } from "@/lib/utils";
import { useFamilyMembers } from "@/hooks/useFamily";

import { useUpdateMemory } from "@/hooks/useMemories";
import { toast } from "sonner";

interface MemoryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: Memory;
}

const MemoryShareModal: React.FC<MemoryShareModalProps> = ({ isOpen, onClose, memory }) => {
  const [shareMethod, setShareMethod] = useState<"family" | "email" | "link">("link");
  const [emailList, setEmailList] = useState("");
  const [message, setMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const updateMemoryMutation = useUpdateMemory();
  const { data: familyData } = useFamilyMembers(memory.userId);
  const familyMembers = familyData?.members || [];

  const [selectedFamilyIds, setSelectedFamilyIds] = useState<Set<string>>(new Set());

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${memory.shareToken || memory.id}`
      : `https://memorylane.app/share/${memory.shareToken || memory.id}`;

  const handleFamilyToggle = (memberId: string) => {
    setSelectedFamilyIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  };

  const handleCopyLink = async () => {
    if (!memory.isPublic) {
      toast.error("Please make the memory public first to share the link.");
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast.success("Link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleTogglePublic = async () => {
    try {
      await updateMemoryMutation.mutateAsync({
        id: memory.id,
        data: { isPublic: !memory.isPublic },
      });
      toast.success(memory.isPublic ? "Memory is now private" : "Memory is now public!");
    } catch {
      console.error("Failed to update privacy settings.");
    }
  };

  const handleShare = () => {
    toast.success("Memory shared successfully!");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Memory" size="md">
      <div className="space-y-6">
        {/* Memory Preview */}
        <div className="rounded-lg bg-neutral-50 p-4">
          <h3 className="mb-2 font-medium text-neutral-900">{memory.title}</h3>
          <p className="line-clamp-2 text-sm text-neutral-600">
            {stripHtml(memory.summary || memory.content)}
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-xs text-neutral-500">
              {new Date(memory.date).toLocaleDateString()}
            </span>
            {memory.location && (
              <span className="text-xs text-neutral-500">• {memory.location}</span>
            )}
          </div>
        </div>

        {/* Share Method Tabs */}
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "family", label: "Family", icon: Users },
              { id: "email", label: "Email", icon: Mail },
              { id: "link", label: "Link", icon: Link },
            ].map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setShareMethod(method.id as "family" | "email" | "link")}
                  className={`flex items-center space-x-2 border-b-2 px-1 py-2 text-sm font-medium ${
                    shareMethod === method.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{method.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Share Content */}
        {shareMethod === "family" && (
          <div className="space-y-4">
            <h4 className="font-medium text-neutral-900">Select family members</h4>
            <div className="space-y-2">
              {familyMembers.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No family members found. Add some in the Friends tab!
                </p>
              ) : (
                familyMembers.map((member) => (
                  <label
                    key={member.id}
                    className="flex cursor-pointer items-center space-x-3 rounded-lg p-3 hover:bg-neutral-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFamilyIds.has(member.id)}
                      onChange={() => handleFamilyToggle(member.id)}
                      className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-neutral-300"
                    />
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200">
                      <span className="text-sm font-medium text-neutral-600">
                        {(member.name || "?")[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{member.name}</p>
                      <p className="text-sm text-neutral-600">{member.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        {shareMethod === "email" && (
          <div className="space-y-4">
            <Input
              label="Email addresses"
              value={emailList}
              onChange={(e) => setEmailList(e.target.value)}
              placeholder="Enter email addresses separated by commas"
              helper="Separate multiple emails with commas"
            />
          </div>
        )}

        {shareMethod === "link" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
              <div>
                <p className="text-sm font-semibold text-neutral-900">Public Access</p>
                <p className="text-xs text-neutral-500">Enable to share via link</p>
              </div>
              <button
                onClick={handleTogglePublic}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  memory.isPublic ? "bg-primary-600" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    memory.isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">Share link</label>
              <div className="flex space-x-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button
                  variant="secondary"
                  onClick={handleCopyLink}
                  className="flex items-center space-x-2"
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-warning-50 border-warning-200 rounded-lg border p-3">
              <p className="text-warning-800 text-sm">
                Anyone with this link will be able to view this memory. Make sure you trust the
                people you share it with.
              </p>
            </div>
          </div>
        )}

        {/* Optional Message */}
        {(shareMethod === "family" || shareMethod === "email") && (
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Add a message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
              className="focus:ring-primary-500 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 border-t border-neutral-200 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleShare}>
            <Share className="mr-2 h-4 w-4" />
            Share Memory
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MemoryShareModal;
