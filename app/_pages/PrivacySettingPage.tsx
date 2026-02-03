"use client";
import React, { useState } from "react";
import { Shield, Users, Eye, Lock, UserPlus } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  relationship: string;
}

const PrivacySettingsPage: React.FC = () => {
  const [privacyMode, setPrivacyMode] = useState<
    "private" | "family" | "selective"
  >("private");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRelationship, setInviteRelationship] = useState("");

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: "family-1",
      name: "Nana",
      email: "mom@family.com",
      avatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      relationship: "Mother",
    },
    {
      id: "family-2",
      name: "George",
      email: "dad@family.com",
      relationship: "Father",
    },
    {
      id: "family-3",
      name: "Dorcas",
      email: "sister@family.com",
      relationship: "Sister",
    },
  ]);

  const relationshipOptions = [
    { value: "parent", label: "Parent" },
    { value: "sibling", label: "Sibling" },
    { value: "spouse", label: "Spouse/Partner" },
    { value: "child", label: "Child" },
    { value: "grandparent", label: "Grandparent" },
    { value: "other", label: "Other Family" },
  ];

  const handleInviteMember = () => {
    if (inviteEmail && inviteRelationship) {
      const newMember: FamilyMember = {
        id: `family-${Date.now()}`,
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        relationship: inviteRelationship,
      };
      setFamilyMembers([...familyMembers, newMember]);
      setInviteEmail("");
      setInviteRelationship("");
      setShowInviteDialog(false);
    }
  };

  const removeMember = (memberId: string) => {
    setFamilyMembers((members) =>
      members.filter((member) => member.id !== memberId)
    );
  };

  return (
    <div className="min-h-fit bg-neutral-50">
      <div className="flex">
        <main className="flex">
          <div className="p-6 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-display font-bold text-neutral-900">
                  Privacy & Sharing
                </h1>
                <p className="text-neutral-600 mt-1">
                  Control who can see your memories and how they&apos;re shared
                </p>
              </div>

              {/* Privacy Mode Selection */}
              <Card>
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-primary-600" />
                    <h2 className="text-xl font-semibold text-neutral-900">
                      Privacy Mode
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      privacyMode === "private"
                        ? "border-primary-300 bg-primary-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                    onClick={() => setPrivacyMode("private")}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full border-2 border-primary-600 flex items-center justify-center mt-0.5">
                        {privacyMode === "private" && (
                          <div className="w-3 h-3 bg-primary-600 rounded-full" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-neutral-600" />
                          <h3 className="font-medium text-neutral-900">
                            Private (Recommended)
                          </h3>
                        </div>
                        <p className="text-sm text-neutral-600 mt-1">
                          Only you can see your memories. Full encryption and
                          privacy protection.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      privacyMode === "family"
                        ? "border-primary-300 bg-primary-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                    onClick={() => setPrivacyMode("family")}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full border-2 border-primary-600 flex items-center justify-center mt-0.5">
                        {privacyMode === "family" && (
                          <div className="w-3 h-3 bg-primary-600 rounded-full" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-neutral-600" />
                          <h3 className="font-medium text-neutral-900">
                            Family Timeline
                          </h3>
                        </div>
                        <p className="text-sm text-neutral-600 mt-1">
                          Share memories automatically with invited family
                          members.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      privacyMode === "selective"
                        ? "border-primary-300 bg-primary-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                    onClick={() => setPrivacyMode("selective")}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full border-2 border-primary-600 flex items-center justify-center mt-0.5">
                        {privacyMode === "selective" && (
                          <div className="w-3 h-3 bg-primary-600 rounded-full" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-neutral-600" />
                          <h3 className="font-medium text-neutral-900">
                            Selective Sharing
                          </h3>
                        </div>
                        <p className="text-sm text-neutral-600 mt-1">
                          Choose which memories to share on a case-by-case
                          basis.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Family Members (only show if family or selective mode) */}
              {(privacyMode === "family" || privacyMode === "selective") && (
                <Card>
                  <div className="p-6 border-b border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-primary-600" />
                        <h2 className="text-xl font-semibold text-neutral-900">
                          Family Members
                        </h2>
                      </div>
                      <Button
                        onClick={() => setShowInviteDialog(true)}
                        size="sm"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Member
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {familyMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg"
                        >
                          <div className="w-12 h-12 bg-neutral-200 rounded-full overflow-hidden shrink-0">
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-neutral-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-neutral-900">
                                {member.name}
                              </h3>
                            </div>
                            <p className="text-sm text-neutral-600">
                              {member.email}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {member.relationship}
                            </p>
                          </div>

                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMember(member.id)}
                              className="text-destructive-600 hover:text-destructive-700"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Default Sharing Settings */}
              <Card>
                <div className="p-6 border-b border-neutral-200">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Default Sharing Settings
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-neutral-900">
                        Auto-share new memories
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Automatically share new memories based on your privacy
                        mode
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={privacyMode === "family"}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-neutral-900">
                        Allow family comments
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Let family members add comments to your memories
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-neutral-900">
                        Email notifications
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Get notified when family members interact with your
                        memories
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button>Save Privacy Settings</Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Invite Member Dialog */}
      <ConfirmDialog
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        onConfirm={handleInviteMember}
        title="Invite Family Member"
        message=""
        confirmLabel="Send Invitation"
        cancelLabel="Cancel"
      >
        <div className="space-y-4 text-left">
          <Input
            label="Email Address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="family@example.com"
          />
          <Select
            label="Relationship"
            options={relationshipOptions}
            value={inviteRelationship}
            onChange={setInviteRelationship}
            placeholder="Select relationship"
          />
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
            <p className="text-sm text-primary-800">
              They&apos;ll receive an email invitation to join your family
              timeline and can view memories you choose to share.
            </p>
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
};

export default PrivacySettingsPage;
