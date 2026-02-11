"use client";
import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  Download,
  Trash,
  Cloud,
  SignOut,
  PencilSimple,
  Check,
  X,
  Spinner,
} from "@phosphor-icons/react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import DeleteAccountModal from "@/components/DeleteAccountModal"; 
import { signOut, useSession } from "next-auth/react";
import { useUserSettings, useUpdateUserSettings } from "@/hooks/useUserSettings";
import Loading from "@/components/ui/Loading";
import { toast } from "sonner";
import { apiService } from "@/services/api.service";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeSection, setActiveSection] = useState("account");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { data: session, update: updateSession } = useSession();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

useEffect(() => {
    setMounted(true);
  }, []);
  
  const { data: settings, isLoading, error } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  const [localName, setLocalName] = useState("");
  const [localAvatar, setLocalAvatar] = useState("");
  const [localBio, setLocalBio] = useState("");
  const [localUsername, setLocalUsername] = useState("");

useEffect(() => {
    if (settings) {
      setLocalName(settings.name);
      setLocalAvatar(settings.avatar || "");
      setLocalBio(settings.bio || "");
      setLocalUsername(settings.username || "");
    }
  }, [settings]);

  const handleSaveProfile = async () => {
    try {
      await updateSettings.mutateAsync({
        name: localName,
        avatar: localAvatar,
        bio: localBio,
        username: localUsername,
      });

      // Update session to reflect changes across the app
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: localName,
          username: localUsername,
          image: localAvatar,
        },
      });

      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    if (settings) {
      setLocalName(settings.name);
      setLocalAvatar(settings.avatar || "");
      setLocalBio(settings.bio || "");
      setLocalUsername(settings.username || "");
    }
    setIsEditing(false);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/user/export", { method: "POST" });
      if (!res.ok) throw new Error("Failed to start export");
      toast.success("Data export started. You will be notified when it's ready.");
    } catch {
      toast.error("Failed to start data export");
    } finally {
      setIsExporting(false);
    }
  };

  if (!mounted || isLoading) {
    return <Loading fullPage text="Applying your preferences..." />;
  }

  if (error || !settings) {
    return (
      <div className="min-h-100 flex items-center justify-center">
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
                  <section.icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium text-sm sm:text-base">
                    {section.label}
                  </span>
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
                <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Profile Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-neutral-500 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit Profile"
                    >
                      <PencilSimple className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 text-neutral-500 hover:text-destructive-900 hover:bg-destructive-50 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={updateSettings.isPending}
                        className="p-2 text-neutral-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        title="Save"
                      >
                        {updateSettings.isPending ? (
                          <Spinner className="w-5 h-5 animate-spin" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  )}
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
                          <span className="text-2xl font-bold text-secondary-400">
                            {localName ? localName[0] : "U"}
                          </span>
                        )}
                      </div>
                      {isEditing && (
                        <>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              // Validate file size (max 5MB)
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error("Image must be less than 5MB");
                                return;
                              }

                              // Validate file type
                              if (
                                ![
                                  "image/jpeg",
                                  "image/png",
                                  "image/webp",
                                ].includes(file.type)
                              ) {
                                toast.error(
                                  "Only JPG, PNG, and WebP images are supported",
                                );
                                return;
                              }

                              // Show loading toast
                              const uploadToast = toast.loading(
                                "Uploading profile picture...",
                              );

                              try {
                                const urls = await apiService.uploadFiles(file);

                                if (!urls || urls.length === 0) {
                                  throw new Error(
                                    "Failed to upload profile picture",
                                  );
                                }

                                const imageUrl = urls[0];
                                setLocalAvatar(imageUrl);
                                toast.success(
                                  "Profile picture uploaded successfully!",
                                  { id: uploadToast },
                                );
                              } catch (error) {
                                console.error("Upload error:", error);
                                toast.error(
                                  "Failed to upload image. Please try again.",
                                  { id: uploadToast },
                                );
                              }
                            }}
                            className="hidden"
                            id="avatar-upload"
                          />
                          <label
                            htmlFor="avatar-upload"
                            className="cursor-pointer"
                          >
                            <span className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition-colors">
                              Change Photo
                            </span>
                          </label>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Username"
                      value={localUsername}
                      onChange={(e) => setLocalUsername(e.target.value)}
                      placeholder="Choose a unique username"
                      prefix="@"
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Input
                      label="Full Name"
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      placeholder="Your name"
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={localBio}
                      onChange={(e) => setLocalBio(e.target.value)}
                      placeholder="Tell us a bit about yourself..."
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 min-h-25 resize-none disabled:bg-neutral-50 disabled:text-neutral-500"
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Input
                      label="Email"
                      value={settings.email}
                      onChange={() => {}}
                      disabled
                    />
                    <p className="mt-1 text-sm text-neutral-500">
                      Email cannot be changed
                    </p>
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
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center space-x-2"
                  >
                    {isSigningOut ? (
                      <Spinner className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SignOut className="w-4 h-4" />
                    )}
                    <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
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
                    Download all your memories and data in JSON format. This
                    process happens in the background.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={handleExportData}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Spinner className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isExporting ? "Starting Export..." : "Export All Data"}
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
                    onClick={() => setShowDeleteModal(true)}
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

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userEmail={settings.email}
      />
    </div>
  );
}
