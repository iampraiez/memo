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
  Shield,
  Sparkle,
  Database,
  Camera,
  CaretRight,
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
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { data: session, update: updateSession } = useSession();

  const { data: settings, isLoading, error } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  const [localName, setLocalName] = useState("");
  const [localAvatar, setLocalAvatar] = useState("");
  const [localBio, setLocalBio] = useState("");
  const [localUsername, setLocalUsername] = useState("");
  
  // Preference states
  const [localAiEnabled, setLocalAiEnabled] = useState(true);
  const [localPrivacyMode, setLocalPrivacyMode] = useState("private");
  const [localAutoBackup, setLocalAutoBackup] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (settings) {
      setLocalName(settings.name);
      setLocalAvatar(settings.avatar || "");
      setLocalBio(settings.bio || "");
      setLocalUsername(settings.username || "");
      setLocalAiEnabled(settings.preferences?.aiEnabled ?? true);
      setLocalPrivacyMode(settings.preferences?.privacyMode || "private");
      setLocalAutoBackup(settings.preferences?.autoBackup ?? true);
    }
  }, [settings]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  const handleSaveProfile = async () => {
    try {
      await updateSettings.mutateAsync({
        name: localName,
        avatar: localAvatar,
        bio: localBio,
        username: localUsername,
      });

      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: localName,
          username: localUsername,
          image: localAvatar,
        },
      });

      setIsEditingProfile(false);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleUpdatePreference = async (key: string, value: any) => {
    try {
      // Optimistic update for UI if needed, but here we just send
      const updatedPreferences: any = {
        aiEnabled: key === "aiEnabled" ? value : localAiEnabled,
        privacyMode: key === "privacyMode" ? value : localPrivacyMode,
        autoBackup: key === "autoBackup" ? value : localAutoBackup,
      };

      await updateSettings.mutateAsync({
        preferences: updatedPreferences as any
      });

      if (key === "aiEnabled") setLocalAiEnabled(value);
      if (key === "privacyMode") setLocalPrivacyMode(value);
      if (key === "autoBackup") setLocalAutoBackup(value);
      
      toast.success("Preferences updated");
    } catch {
      toast.error("Failed to update preferences");
    }
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
    return <Loading fullPage text="Syncing with the Sanctuary..." />;
  }

  if (error || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Connection Interrupted</h2>
          <p className="text-neutral-600">We couldn't reach your vault. Please try again later.</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Retry Connection
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-neutral-900 tracking-tight">
            Settings
          </h1>
          <p className="text-neutral-500 mt-1">
            Personalize your Sanctuary experience.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="h-11 px-6 rounded-xl border-neutral-200 hover:bg-neutral-50"
        >
          {isSigningOut ? (
            <Spinner className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <SignOut className="w-4 h-4 mr-2" />
          )}
          <span>Sign Out</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 px-1">
            <UserIcon weight="duotone" className="w-5 h-5 text-primary-600" />
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
              Identity
            </h2>
          </div>
          <Card className="overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center gap-8">
                <div className="relative group">
                  {/* Outer Frame with Gradient and Shadow */}
                  <div className="p-1 rounded-full bg-linear-to-br from-primary-100 via-white to-secondary-100 shadow-2xl ring-1 ring-neutral-200/50">
                    <div className="p-1 rounded-full bg-white/40 backdrop-blur-md">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-xl bg-primary-900 flex items-center justify-center relative">
                        {localAvatar ? (
                          <Image
                            src={localAvatar}
                            alt="Profile"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-secondary-400">
                            {localName ? localName[0] : "U"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Upload Button */}
                  <button
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                    className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border border-neutral-100 hover:scale-110 active:scale-95 transition-all text-primary-600 z-10"
                    title="Change Photo"
                  >
                    <Camera weight="bold" className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const uploadToast = toast.loading("Uploading your portrait...");
                      try {
                        const urls = await apiService.uploadFiles(file);
                        if (!urls.length) throw new Error();
                        setLocalAvatar(urls[0]);
                        toast.success("Portrait updated", { id: uploadToast });
                      } catch {
                        toast.error("Upload failed", { id: uploadToast });
                      }
                    }}
                    className="hidden"
                    id="avatar-upload"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <h3 className="text-2xl font-bold text-neutral-900">{localName || "Your Name"}</h3>
                  <p className="text-primary-600 font-medium font-mono text-sm">@{localUsername || "username"}</p>
                </div>

                <div className="flex items-center space-x-2">
                  {!isEditingProfile ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                      className="rounded-lg h-10 px-4"
                    >
                      <PencilSimple weight="bold" className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        <X weight="bold" className="w-5 h-5" />
                      </button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={updateSettings.isPending}
                        className="rounded-lg h-10 px-4 bg-primary-900 hover:bg-black"
                      >
                        {updateSettings.isPending ? (
                          <Spinner className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check weight="bold" className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isEditingProfile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100 animate-in fade-in slide-in-from-top-4 duration-300">
                  <Input
                    label="Display Name"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    placeholder="Enter your name"
                  />
                  <Input
                    label="Username"
                    value={localUsername}
                    onChange={(e) => setLocalUsername(e.target.value)}
                    placeholder="Choose a handle"
                    prefix="@"
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-neutral-700 mb-2">
                      Short Bio
                    </label>
                    <textarea
                      value={localBio}
                      onChange={(e) => setLocalBio(e.target.value)}
                      placeholder="Share a bit about your journey..."
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px] resize-none transition-all outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Preferences Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 px-1">
            <Sparkle weight="duotone" className="w-5 h-5 text-primary-600" />
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
              Sanctuary Pulse
            </h2>
          </div>
          <Card>
            <div className="divide-y divide-neutral-100">
              {/* Privacy Mode */}
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Shield weight="duotone" className="w-5 h-5 text-neutral-900" />
                    <h3 className="font-bold text-neutral-900">Privacy Mode</h3>
                  </div>
                  <p className="text-sm text-neutral-500">Control who can discover and see your memories.</p>
                </div>
                <div className="flex items-center p-1 bg-neutral-100 rounded-xl">
                  {["private", "sanctuary"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleUpdatePreference("privacyMode", mode)}
                      className={cn(
                        "px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize",
                        localPrivacyMode === mode
                          ? "bg-white text-primary-900 shadow-sm"
                          : "text-neutral-500 hover:text-neutral-900"
                      )}
                    >
                      {mode === "sanctuary" ? "Sanctuary Circle" : "Private"}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Features */}
              <div className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Sparkle weight="duotone" className="w-5 h-5 text-neutral-900" />
                    <h3 className="font-bold text-neutral-900">AI Enhancement</h3>
                  </div>
                  <p className="text-sm text-neutral-500">Let AI help organize and summarize your moments.</p>
                </div>
                <button
                  onClick={() => handleUpdatePreference("aiEnabled", !localAiEnabled)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    localAiEnabled ? "bg-primary-900" : "bg-neutral-200"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      localAiEnabled ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Auto Backup */}
              <div className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Database weight="duotone" className="w-5 h-5 text-neutral-900" />
                    <h3 className="font-bold text-neutral-900">Auto Preservation</h3>
                  </div>
                  <p className="text-sm text-neutral-500">Automatically sync your media to secure cloud storage.</p>
                </div>
                <button
                  onClick={() => handleUpdatePreference("autoBackup", !localAutoBackup)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    localAutoBackup ? "bg-primary-900" : "bg-neutral-200"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      localAutoBackup ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>
          </Card>
        </section>

        {/* Data Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 px-1">
            <Cloud weight="duotone" className="w-5 h-5 text-primary-600" />
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
              Vault Data
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 flex flex-col justify-between group hover:border-primary-200 transition-colors">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-900 group-hover:text-white transition-all">
                  <Download weight="bold" className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-neutral-900">Export All Memories</h3>
                  <p className="text-sm text-neutral-500">Download your entire journey in a portable JSON format.</p>
                </div>
              </div>
              <Button
                variant="secondary"
                disabled={isExporting}
                onClick={handleExportData}
                className="mt-6 w-full rounded-xl border-neutral-200 font-bold"
              >
                {isExporting ? <Spinner className="w-4 h-4 animate-spin" /> : "Initiate Export"}
              </Button>
            </Card>

            <Card className="p-6 flex flex-col justify-between border-red-100 bg-red-50/10 hover:border-red-200 transition-colors">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                  <Trash weight="bold" className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-red-900">Dissolve Sanctuary</h3>
                  <p className="text-sm text-neutral-500">Permanently remove your account and all associated memories.</p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteModal(true)}
                className="mt-6 w-full rounded-xl font-bold bg-red-600 hover:bg-red-700"
              >
                Delete Account
              </Button>
            </Card>
          </div>
        </section>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userEmail={settings.email}
      />
    </div>
  );
}
