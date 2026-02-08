"use client";
import React, { useState } from "react";
import {
  User as UserIcon,
  Download,
  Trash,
  Cloud,
  Palette,
  SignOut,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { signOut } from "next-auth/react";
import { useUserSettings, useUpdateUserSettings } from "@/hooks/useUserSettings";
import Loading from "@/components/ui/Loading";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("account");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const { data: settings, isLoading, error } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  const [localName, setLocalName] = useState("");
  const [localAvatar, setLocalAvatar] = useState("");
  const [localBio, setLocalBio] = useState("");
  const [localUsername, setLocalUsername] = useState("");

  React.useEffect(() => {
    if (settings) {
      setLocalName(settings.name);
      setLocalAvatar(settings.avatar || "");
      setLocalBio(settings.bio || "");
      setLocalUsername(settings.username || "");
    }
  }, [settings]);

  const handleSaveProfile = async () => {
    await updateSettings.mutateAsync({
      name: localName,
      avatar: localAvatar,
      bio: localBio,
      username: localUsername,
    });
  };

  if (!mounted || isLoading) {
    return <Loading fullPage text="Applying your preferences..." />;
  }

  if (error || !settings) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center p-6">
            <p className="text-destructive-600">Failed to load settings</p>
          </div>
        </Card>
      </div>
    );
  }

  const sections = [
    { id: "account", label: "Account", icon: UserIcon },
    { id: "data", label: "Data & Privacy", icon: Cloud },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900">
          Settings
        </h1>
        <p className="text-neutral-600 mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 overflow-x-auto pb-2 lg:pb-0">
          <Card className="p-2 lg:p-4">
            <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap lg:w-full font-bold text-sm ${
                    activeSection === section.id
                      ? "bg-primary-900 text-white shadow-xl shadow-primary-900/10"
                      : "text-neutral-500 hover:bg-primary-50 hover:text-primary-900"
                  }`}
                >
                  <section.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">{section.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === "account" && (
            <div className="space-y-6">
              {/* Profile */}
              <Card>
                <div className="p-6 border-b border-neutral-200">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Profile Information
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-neutral-100 shadow-sm bg-primary-900 flex items-center justify-center">
                        {localAvatar ? (
                          <Image
                            src={localAvatar}
                            alt="Profile"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-secondary-400">{localName ? localName[0] : 'U'}</span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setLocalAvatar(url);
                          }
                        }}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <span className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition-colors">
                          Change Photo
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Username"
                      value={localUsername}
                      onChange={(e) => setLocalUsername(e.target.value)}
                      placeholder="Choose a unique username"
                      prefix="@"
                    />
                  </div>

                  <div>
                    <Input
                      label="Full Name"
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Bio</label>
                    <textarea
                      value={localBio}
                      onChange={(e) => setLocalBio(e.target.value)}
                      placeholder="Tell us a bit about yourself..."
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 min-h-[100px] resize-none"
                    />
                  </div>

                  <div>
                    <Input
                      label="Email"
                      value={settings.email}
                      onChange={() => {}}
                      disabled
                    />
                    <p className="mt-1 text-sm text-neutral-500">Email cannot be changed</p>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={updateSettings.isPending}
                    >
                      {updateSettings.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Sign Out */}
              <Card>
                <div className="p-6 border-b border-neutral-200">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Session
                  </h2>
                </div>
                <div className="p-6">
                  <Button
                    variant="secondary"
                    onClick={() => signOut()}
                    className="flex items-center space-x-2"
                  >
                    <SignOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </Card>
            </div>
          )}


          {activeSection === "data" && (
            <div className="space-y-6">
              {/* Export Data */}
              <Card>
                <div className="p-6 border-b border-neutral-200">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Export Data
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-neutral-600 mb-4">
                    Download all your memories and data in JSON format
                  </p>
                  <Button variant="secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data
                  </Button>
                </div>
              </Card>

              {/* Delete Account */}
              <Card className="border-destructive-200">
                <div className="p-6 border-b border-destructive-200">
                  <h2 className="text-xl font-semibold text-destructive-900">
                    Danger Zone
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-neutral-600 mb-4">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          // Handle account deletion
          setShowDeleteDialog(false);
        }}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
        confirmLabel="Delete Account"
        cancelLabel="Cancel"
        variant="destructive"
      />
    </div>
  );
}
