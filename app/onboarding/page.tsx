"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  CaretRight,
  UploadSimple,
  Shield,
  Sparkle,
  Tag,
  User,
  Spinner,
  Camera,
  X,
  CaretLeft,
  Users,
  House,
  BookOpen,
} from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import { apiService } from "@/services/api.service";

const OnboardingFlow: React.FC = () => {
  const { data: session, update } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    bio: "",
    image: null as string | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [preferences, setPreferences] = useState({
    importData: false,
    privacyMode: "private",
    aiEnabled: true,
    selectedTags: [] as string[],
  });

  // Pre-fill data for Google users
  useEffect(() => {
    if (session?.user) {
      setProfileData((prev) => ({
        ...prev,
        name: session.user.name || "",
        image: session.user.image || null,
      }));
      if (session.user.image) {
        setImagePreview(session.user.image);
      }
    }
  }, [session]);

  const steps = [
    { id: "welcome", title: "Welcome", icon: Sparkle },
    { id: "profile", title: "Profile Setup", icon: User },
    { id: "features", title: "Get Started", icon: BookOpen },
    { id: "preferences", title: "Preferences", icon: Shield },
    { id: "tags", title: "Choose Tags", icon: Tag },
  ];

  const suggestedTags = [
    "family",
    "friends",
    "travel",
    "work",
    "hobbies",
    "food",
    "pets",
    "sports",
    "music",
    "books",
    "movies",
    "celebrations",
    "holidays",
    "achievements",
    "learning",
    "health",
    "nature",
    "photography",
    "art",
    "technology",
  ];

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP images are supported");
      return;
    }

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    setIsUploadingImage(true);
    try {
      const urls = await apiService.uploadFiles(file);

      if (!urls || urls.length === 0) {
        throw new Error("Failed to upload profile picture");
      }

      const imageUrl = urls[0];

      // Store the uploaded URL
      setProfileData((prev) => ({ ...prev, image: imageUrl }));
      setSelectedFile(null); // Clear selected file since it's now uploaded
      toast.success("Profile picture uploaded successfully!");
    } catch (error: unknown) {
      console.error("Upload error details:", error);

      toast.error("Failed to upload image. Please try again.");

      // Clear the file input so the user can try the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(session?.user?.image || null);
    setProfileData((prev) => ({
      ...prev,
      image: session?.user?.image || null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const nextStep = async () => {
    if (steps[currentStep].id === "profile") {
      // Validate name
      if (!profileData.name.trim()) {
        toast.error("Please enter your name");
        return;
      }
      if (profileData.name.length < 2 || profileData.name.length > 50) {
        toast.error("Name must be between 2 and 50 characters");
        return;
      }

      // Validate username
      if (!profileData.username.trim()) {
        toast.error("Please choose a username");
        return;
      }
      if (profileData.username.length < 3 || profileData.username.length > 20) {
        toast.error("Username must be between 3 and 20 characters");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
        toast.error("Username can only contain letters, numbers, and underscores");
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setIsSubmitting(true);
    try {
      // Image is already uploaded via handleImageSelect, just use the URL
      const imageUrl = profileData.image;

      // Update Profile and Preferences
      const profileResponse = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          username: profileData.username,
          bio: profileData.bio,
          image: imageUrl,
          isOnboarded: true,
          preferences: {
            aiEnabled: preferences.aiEnabled,
            privacyMode: preferences.privacyMode,
            // selectedTags could be handled separately or added to preferences if needed
          },
        }),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      // Update Session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: profileData.name,
          username: profileData.username,
          image: imageUrl,
          isOnboarded: true,
        },
      });

      localStorage.removeItem("route");
      // Force a hard reload to ensure the session and middleware are fully synced
      window.location.href = "/timeline";
      toast.success("Welcome to your Sanctuary!");
    } catch (error: unknown) {
      console.error("Onboarding error:", error);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const message =
        error instanceof Error ? error.message : "Failed to complete setup. Please try again.";

      toast.error(message);
      // If the error is about username, go back to the profile step so the user can fix it
      if (message.toLowerCase().includes("username")) {
        setCurrentStep(1); // profile step
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleTag = (tag: string) => {
    setPreferences((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  if (!session) {
    return null;
  }

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case "welcome":
        return (
          <div className="space-y-6 text-center">
            <div className="bg-primary-900 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl">
              <Sparkle weight="fill" className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-3">
              <h1 className="font-display text-3xl font-bold text-neutral-900">
                Welcome to Memory Lane
              </h1>
              <p className="mx-auto max-w-md text-lg text-neutral-600">
                Let&apos;s set up your personal timeline to start capturing and preserving your
                life&apos;s most precious moments.
              </p>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              <h2 className="font-display text-2xl font-bold text-neutral-900">
                Create Your Profile
              </h2>
              <p className="text-neutral-600">Tell us about yourself</p>
            </div>

            <div className="mx-auto max-w-md space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Profile preview"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-12 w-12 text-neutral-400" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary-600 hover:bg-primary-700 absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  {imagePreview && imagePreview !== session?.user?.image && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-colors hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <p className="text-center text-xs text-neutral-500">
                  {session?.user?.image && !selectedFile
                    ? "Using your Google profile picture. Click to change."
                    : "Upload a profile picture (optional, max 5MB)"}
                </p>
              </div>

              {/* Name Input */}
              <div>
                <Input
                  label="Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
                <p className="mt-1 text-xs text-neutral-500">
                  {session?.user?.name
                    ? "Pre-filled from your Google account. You can change it."
                    : "How should we address you?"}
                </p>
              </div>

              {/* Username Input */}
              <div>
                <Input
                  label="Username"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  placeholder="e.g. memorykeeper"
                  required
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Unique identifier for social discovery.
                </p>
              </div>

              {/* Bio Textarea */}
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us a bit about yourself..."
                  rows={4}
                  maxLength={500}
                  className="focus:ring-primary-500 w-full rounded-lg border border-neutral-300 px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:outline-none"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Optional. Visible on your profile. ({profileData.bio.length}
                  /500)
                </p>
              </div>
            </div>
          </div>
        );

      case "features":
        return (
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              <h2 className="font-display text-2xl font-bold text-neutral-900">
                Discover Your Sanctuary
              </h2>
              <p className="text-neutral-600">
                Explore the powerful features designed to preserve your life&apos;s narrative.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="space-y-3 border-transparent bg-neutral-50/50 p-4">
                <div className="bg-primary-100 flex h-10 w-10 items-center justify-center rounded-lg">
                  <BookOpen weight="fill" className="text-primary-600 h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold">AI Stories</h3>
                <p className="text-xs text-neutral-500">
                  Transform scattered memories into beautiful, cohesive narratives.
                </p>
              </Card>

              <Card className="space-y-3 border-transparent bg-neutral-50/50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Users weight="fill" className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold">Family Circle</h3>
                <p className="text-xs text-neutral-500">
                  Build a private space to share and preserve moments with loved ones.
                </p>
              </Card>

              <Card className="space-y-3 border-transparent bg-neutral-50/50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <UploadSimple weight="fill" className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-sm font-bold">The Vault</h3>
                <p className="text-xs text-neutral-500">
                  Securely upload and organize your precious photo library.
                </p>
              </Card>

              <Card className="space-y-3 border-transparent bg-neutral-50/50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <House weight="fill" className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-sm font-bold">Timeline</h3>
                <p className="text-xs text-neutral-500">
                  Capture daily reflections and see your life journey unfold.
                </p>
              </Card>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              <h2 className="font-display text-2xl font-bold text-neutral-900">
                Privacy & Preferences
              </h2>
              <p className="text-neutral-600">Customize your experience and security settings.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Card
                  className={cn(
                    "cursor-pointer border-neutral-200 p-4 transition-all",
                    preferences.privacyMode === "private" && "border-primary-300 bg-primary-50",
                  )}
                  onClick={() => setPreferences((prev) => ({ ...prev, privacyMode: "private" }))}
                >
                  <div className="flex items-start space-x-3">
                    <div className="border-primary-600 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2">
                      {preferences.privacyMode === "private" && (
                        <div className="bg-primary-600 h-2.5 w-2.5 rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Private (Recommended)</h3>
                      <p className="text-xs text-neutral-500">
                        Only you can see your memories by default.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={cn(
                    "cursor-pointer border-neutral-200 p-4 transition-all",
                    preferences.privacyMode === "family" && "border-primary-300 bg-primary-50",
                  )}
                  onClick={() => setPreferences((prev) => ({ ...prev, privacyMode: "family" }))}
                >
                  <div className="flex items-start space-x-3">
                    <div className="border-primary-600 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2">
                      {preferences.privacyMode === "family" && (
                        <div className="bg-primary-600 h-2.5 w-2.5 rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Family Circle</h3>
                      <p className="text-xs text-neutral-500">
                        Automatically prepare moments for sharing with your group.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="border-neutral-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-neutral-900">AI Enhancements</h3>
                    <p className="text-xs text-neutral-500">
                      Enable smart tagging and story generation.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setPreferences((prev) => ({ ...prev, aiEnabled: !prev.aiEnabled }))
                    }
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      preferences.aiEnabled ? "bg-primary-600" : "bg-neutral-200",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        preferences.aiEnabled ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>
              </Card>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="text-primary-600 mt-0.5 h-5 w-5" />
                  <p className="text-xs leading-relaxed text-neutral-600">
                    Your data is encrypted and stored securely. AI features process your memories
                    locally or via secure, isolated environments to ensure your privacy is never
                    compromised.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "tags":
        return (
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              <h2 className="font-display text-2xl font-bold text-neutral-900">Choose Your Tags</h2>
              <p className="text-neutral-600">
                Select categories that matter to you. You can always add more later.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                      preferences.selectedTags.includes(tag)
                        ? "bg-primary-100 border-primary-300 text-primary-800"
                        : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400",
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="from-primary-50 to-secondary-50 flex min-h-screen items-center justify-center bg-linear-to-br px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-neutral-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-neutral-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-neutral-200">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <Card className="space-y-8 p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
            <Button
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 0 || isSubmitting}
              className="flex items-center"
            >
              <CaretLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={nextStep}
              className="flex items-center"
              disabled={isSubmitting || isUploadingImage}
            >
              {isSubmitting || isUploadingImage ? (
                <>
                  <Spinner className="mr-2 h-4 w-4 animate-spin" />
                  {isUploadingImage ? "Uploading..." : "Saving..."}
                </>
              ) : (
                <>
                  {currentStep === steps.length - 1 ? "Complete Setup" : "Continue"}
                  <CaretRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;
