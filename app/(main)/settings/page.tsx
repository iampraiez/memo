"use client";
import { useState, useEffect } from "react";
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
      setLocalAvatar(settings.image || "");
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
        image: localAvatar,
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
    } catch {
      if (settings) {
        setLocalName(settings.name);
        setLocalAvatar(settings.image || "");
        setLocalBio(settings.bio || "");
        setLocalUsername(settings.username || "");
      }
      toast.error("Failed to update profile");
    }
  };

  const handleUpdatePreference = async (key: string, value: boolean | string) => {
    try {
      if (!settings) return;

      const updatedPreferences = {
        ...settings.preferences,
        aiEnabled: key === "aiEnabled" ? (value as boolean) : localAiEnabled,
        privacyMode: (key === "privacyMode" ? (value as string) : localPrivacyMode) as
          | "private"
          | "selective"
          | "family",
        autoBackup: key === "autoBackup" ? (value as boolean) : localAutoBackup,
      };

      await updateSettings.mutateAsync({
        preferences: updatedPreferences,
      });

      if (key === "aiEnabled") setLocalAiEnabled(value as boolean);
      if (key === "privacyMode") setLocalPrivacyMode(value as "private" | "selective" | "family");
      if (key === "autoBackup") setLocalAutoBackup(value as boolean);

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
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md space-y-4 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <X className="h-8 w-8 text-red-500" />
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
    <div className="mx-auto max-w-4xl space-y-10 p-6 pb-20">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-900">
            Settings
          </h1>
          <p className="mt-1 text-neutral-500">Personalize your Sanctuary experience.</p>
        </div>
        <Button
          variant="secondary"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="h-11 rounded-xl border-neutral-200 px-6 hover:bg-neutral-50"
        >
          {isSigningOut ? (
            <Spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <SignOut className="mr-2 h-4 w-4" />
          )}
          <span>Sign Out</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 px-1">
            <UserIcon weight="duotone" className="text-primary-600 h-5 w-5" />
            <h2 className="text-sm font-bold tracking-widest text-neutral-400 uppercase">
              Identity
            </h2>
          </div>
          <Card className="overflow-hidden">
            <div className="space-y-8 p-8">
              <div className="flex flex-col gap-8 md:flex-row md:items-center">
                <div className="group relative">
                  {/* Outer Frame with Gradient and Shadow */}
                  <div className="from-primary-100 to-secondary-100 rounded-full bg-linear-to-br via-white p-1 shadow-2xl ring-1 ring-neutral-200/50">
                    <div className="rounded-full bg-white/40 p-1 backdrop-blur-md">
                      <div className="bg-primary-900 relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-xl">
                        {localAvatar ? (
                          <Image
                            src={localAvatar}
                            alt="Profile"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <span className="text-secondary-400 text-3xl font-bold">
                            {localName ? localName[0] : "U"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Upload Button */}
                  <button
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                    className="text-primary-600 absolute -right-1 -bottom-1 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-100 bg-white shadow-2xl transition-all hover:scale-110 active:scale-95"
                    title="Change Photo"
                  >
                    <Camera weight="bold" className="h-5 w-5" />
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
                  <h3 className="text-2xl font-bold text-neutral-900">
                    {localName || "Your Name"}
                  </h3>
                  <p className="text-primary-600 font-mono text-sm font-medium">
                    @{localUsername || "username"}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {!isEditingProfile ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                      className="h-10 rounded-lg px-4"
                    >
                      <PencilSimple weight="bold" className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="p-2 text-neutral-400 transition-colors hover:text-neutral-600"
                      >
                        <X weight="bold" className="h-5 w-5" />
                      </button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={updateSettings.isPending}
                        className="bg-primary-900 h-10 rounded-lg px-4 hover:bg-black"
                      >
                        {updateSettings.isPending ? (
                          <Spinner className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check weight="bold" className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isEditingProfile && (
                <div className="animate-in fade-in slide-in-from-top-4 grid grid-cols-1 gap-6 border-t border-neutral-100 pt-4 duration-300 md:grid-cols-2">
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
                    <label className="mb-2 block text-sm font-bold text-neutral-700">
                      Short Bio
                    </label>
                    <textarea
                      value={localBio}
                      onChange={(e) => setLocalBio(e.target.value)}
                      placeholder="Share a bit about your journey..."
                      className="focus:ring-primary-500 min-h-25 w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2"
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
            <Sparkle weight="duotone" className="text-primary-600 h-5 w-5" />
            <h2 className="text-sm font-bold tracking-widest text-neutral-400 uppercase">
              Sanctuary Pulse
            </h2>
          </div>
          <Card>
            <div className="divide-y divide-neutral-100">
              {/* Privacy Mode */}
              <div className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Shield weight="duotone" className="h-5 w-5 text-neutral-900" />
                    <h3 className="font-bold text-neutral-900">Privacy Mode</h3>
                  </div>
                  <p className="text-sm text-neutral-500">
                    Control who can discover and see your memories.
                  </p>
                </div>
                <div className="flex items-center rounded-xl bg-neutral-100 p-1">
                  {["private", "sanctuary"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleUpdatePreference("privacyMode", mode)}
                      className={cn(
                        "rounded-lg px-4 py-2 text-xs font-bold capitalize transition-all",
                        localPrivacyMode === mode
                          ? "text-primary-900 bg-white shadow-sm"
                          : "text-neutral-500 hover:text-neutral-900",
                      )}
                    >
                      {mode === "sanctuary" ? "Sanctuary Circle" : "Private"}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Features */}
              <div className="flex items-center justify-between p-6">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Sparkle weight="duotone" className="h-5 w-5 text-neutral-900" />
                    <h3 className="font-bold text-neutral-900">AI Enhancement</h3>
                  </div>
                  <p className="text-sm text-neutral-500">
                    Let AI help organize and summarize your moments.
                  </p>
                </div>
                <button
                  onClick={() => handleUpdatePreference("aiEnabled", !localAiEnabled)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    localAiEnabled ? "bg-primary-900" : "bg-neutral-200",
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      localAiEnabled ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
              </div>

              {/* Auto Backup */}
              <div className="flex items-center justify-between p-6">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Database weight="duotone" className="h-5 w-5 text-neutral-900" />
                    <h3 className="font-bold text-neutral-900">Auto Preservation</h3>
                  </div>
                  <p className="text-sm text-neutral-500">
                    Automatically sync your media to secure cloud storage.
                  </p>
                </div>
                <button
                  onClick={() => handleUpdatePreference("autoBackup", !localAutoBackup)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    localAutoBackup ? "bg-primary-900" : "bg-neutral-200",
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      localAutoBackup ? "translate-x-5" : "translate-x-0",
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
            <Cloud weight="duotone" className="text-primary-600 h-5 w-5" />
            <h2 className="text-sm font-bold tracking-widest text-neutral-400 uppercase">
              Vault Data
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="group hover:border-primary-200 flex flex-col justify-between p-6 transition-colors">
              <div className="space-y-4">
                <div className="bg-primary-50 text-primary-600 group-hover:bg-primary-900 flex h-12 w-12 items-center justify-center rounded-2xl transition-all group-hover:text-white">
                  <Download weight="bold" className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-neutral-900">Export All Memories</h3>
                  <p className="text-sm text-neutral-500">
                    Download your entire journey in a portable JSON format.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                disabled={isExporting}
                onClick={handleExportData}
                className="mt-6 w-full rounded-xl border-neutral-200 font-bold"
              >
                {isExporting ? <Spinner className="h-4 w-4 animate-spin" /> : "Initiate Export"}
              </Button>
            </Card>

            <Card className="flex flex-col justify-between border-red-100 bg-red-50/10 p-6 transition-colors hover:border-red-200">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <Trash weight="bold" className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-red-900">Dissolve Sanctuary</h3>
                  <p className="text-sm text-neutral-500">
                    Permanently remove your account and all associated memories.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteModal(true)}
                className="mt-6 w-full rounded-xl bg-red-600 font-bold hover:bg-red-700"
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
