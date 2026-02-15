import React, { useState } from "react";
import { Share, Users, Mail, Link, Copy, Check } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { Memory } from "@/types/types";

interface MemoryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: Memory;
}

const MemoryShareModal: React.FC<MemoryShareModalProps> = ({ isOpen, onClose, memory }) => {
  const [shareMethod, setShareMethod] = useState<"family" | "email" | "link">("family");
  const [emailList, setEmailList] = useState("");
  const [message, setMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const familyMembers = [
    { id: "1", name: "Mom", email: "mom@family.com", selected: false },
    { id: "2", name: "Dad", email: "dad@family.com", selected: false },
    { id: "3", name: "Sister", email: "sister@family.com", selected: false },
  ];

  const [selectedFamily, setSelectedFamily] = useState(familyMembers);

  const shareUrl = `https://memorylane.app/memory/${memory.id}`;

  const handleFamilyToggle = (memberId: string) => {
    setSelectedFamily((members) =>
      members.map((member) =>
        member.id === memberId ? { ...member, selected: !member.selected } : member,
      ),
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleShare = () => {
    // Implementation would depend on the sharing method
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Memory" size="md">
      <div className="space-y-6">
        {/* Memory Preview */}
        <div className="rounded-lg bg-neutral-50 p-4">
          <h3 className="mb-2 font-medium text-neutral-900">{memory.title}</h3>
          <p className="line-clamp-2 text-sm text-neutral-600">
            {memory.summary || memory.content}
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
              {selectedFamily.map((member) => (
                <label
                  key={member.id}
                  className="flex cursor-pointer items-center space-x-3 rounded-lg p-3 hover:bg-neutral-50"
                >
                  <input
                    type="checkbox"
                    checked={member.selected}
                    onChange={() => handleFamilyToggle(member.id)}
                    className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-neutral-300"
                  />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200">
                    <span className="text-sm font-medium text-neutral-600">{member.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{member.name}</p>
                    <p className="text-sm text-neutral-600">{member.email}</p>
                  </div>
                </label>
              ))}
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
