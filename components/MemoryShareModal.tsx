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

const MemoryShareModal: React.FC<MemoryShareModalProps> = ({
  isOpen,
  onClose,
  memory,
}) => {
  const [shareMethod, setShareMethod] = useState<"family" | "email" | "link">(
    "family"
  );
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
        member.id === memberId
          ? { ...member, selected: !member.selected }
          : member
      )
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
    console.log("Sharing memory:", memory.id, "via", shareMethod);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Memory" size="md">
      <div className="space-y-6">
        {/* Memory Preview */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <h3 className="font-medium text-neutral-900 mb-2">{memory.title}</h3>
          <p className="text-sm text-neutral-600 line-clamp-2">
            {memory.summary || memory.content}
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-xs text-neutral-500">
              {new Date(memory.date).toLocaleDateString()}
            </span>
            {memory.location && (
              <span className="text-xs text-neutral-500">
                • {memory.location}
              </span>
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
                  onClick={() =>
                    setShareMethod(method.id as "family" | "email" | "link")
                  }
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    shareMethod === method.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{method.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Share Content */}
        {shareMethod === "family" && (
          <div className="space-y-4">
            <h4 className="font-medium text-neutral-900">
              Select family members
            </h4>
            <div className="space-y-2">
              {selectedFamily.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center space-x-3 p-3 hover:bg-neutral-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={member.selected}
                    onChange={() => handleFamilyToggle(member.id)}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-neutral-600">
                      {member.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      {member.name}
                    </p>
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
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Share link
              </label>
              <div className="flex space-x-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button
                  variant="secondary"
                  onClick={handleCopyLink}
                  className="flex items-center space-x-2"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
              <p className="text-sm text-warning-800">
                Anyone with this link will be able to view this memory. Make
                sure you trust the people you share it with.
              </p>
            </div>
          </div>
        )}

        {/* Optional Message */}
        {(shareMethod === "family" || shareMethod === "email") && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Add a message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleShare}>
            <Share className="w-4 h-4 mr-2" />
            Share Memory
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MemoryShareModal;
