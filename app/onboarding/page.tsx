"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  CaretRight,
  UploadSimple,
  Shield,
  Sparkle,
  Tag,
  Check,
  User,
  Spinner,
  Camera,
  X,
  CaretLeft,
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
    { id: "import", title: "Import Data", icon: UploadSimple },
    { id: "privacy", title: "Privacy Settings", icon: Shield },
    { id: "ai", title: "AI Features", icon: Sparkle },
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

      const message =
        error instanceof Error
          ? error.message
          : "Failed to upload image. Please try again.";
      toast.error(message);

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
        toast.error(
          "Username can only contain letters, numbers, and underscores",
        );
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
      const message =
        error instanceof Error
          ? error.message
          : "Failed to complete setup. Please try again.";
      toast.error(message);
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
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-primary-900 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
              <Sparkle weight="fill" className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-display font-bold text-neutral-900">
                Welcome to Memory Lane
              </h1>
              <p className="text-lg text-neutral-600 max-w-md mx-auto">
                Let&apos;s set up your personal timeline to start capturing and
                preserving your life&apos;s most precious moments.
              </p>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-display font-bold text-neutral-900">
                Create Your Profile
              </h2>
              <p className="text-neutral-600">Tell us about yourself</p>
            </div>

            <div className="space-y-6 max-w-md mx-auto">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-100 border-2 border-neutral-200">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Profile preview"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-neutral-400" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  {imagePreview && imagePreview !== session?.user?.image && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
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
                <p className="text-xs text-neutral-500 text-center">
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
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  placeholder="Your full name"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
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
                  onChange={(e) =>
                    setProfileData({ ...profileData, username: e.target.value })
                  }
                  placeholder="e.g. memorykeeper"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Unique identifier for social discovery.
                </p>
              </div>

              {/* Bio Textarea */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  placeholder="Tell us a bit about yourself..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Optional. Visible on your profile. ({profileData.bio.length}
                  /500)
                </p>
              </div>
            </div>
          </div>
        );

      case "import":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-display font-bold text-neutral-900">
                Import Your Existing Data
              </h2>
              <p className="text-neutral-600">
                Bring your memories from other platforms or files to get started
                quickly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 text-center space-y-3 hover:border-primary-300 cursor-pointer transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-blue-600 font-bold text-lg">f</span>
                </div>
                <h3 className="font-medium">Facebook</h3>
                <p className="text-sm text-neutral-500">
                  Import photos and posts
                </p>
              </Card>

              <Card className="p-4 text-center space-y-3 hover:border-primary-300 cursor-pointer transition-colors">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-red-600 font-bold text-lg">G</span>
                </div>
                <h3 className="font-medium">Google Photos</h3>
                <p className="text-sm text-neutral-500">
                  Import your photo library
                </p>
              </Card>

              <Card className="p-4 text-center space-y-3 hover:border-neutral-900 cursor-pointer transition-colors group">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto transition-colors group-hover:bg-neutral-200">
                  <UploadSimple className="w-6 h-6 text-neutral-600" />
                </div>
                <h3 className="font-bold text-sm">Upload Files</h3>
                <p className="text-xs text-neutral-500">
                  Import from your device
                </p>
              </Card>

              <Card className="p-4 text-center space-y-3 hover:border-primary-300 cursor-pointer transition-colors">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-neutral-600 font-bold text-lg">✓</span>
                </div>
                <h3 className="font-medium">Start Fresh</h3>
                <p className="text-sm text-neutral-500">
                  Begin with a clean slate
                </p>
              </Card>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-display font-bold text-neutral-900">
                Privacy Settings
              </h2>
              <p className="text-neutral-600">
                Choose how you want to protect and share your memories.
              </p>
            </div>

            <div className="space-y-4">
              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all",
                  preferences.privacyMode === "private" &&
                    "border-primary-300 bg-primary-50",
                )}
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    privacyMode: "private",
                  }))
                }
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-primary-600 flex items-center justify-center mt-0.5">
                    {preferences.privacyMode === "private" && (
                      <div className="w-3 h-3 bg-primary-600 rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">
                      Private (Recommended)
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Only you can see your memories. Full encryption and
                      privacy protection.
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all",
                  preferences.privacyMode === "selective" &&
                    "border-primary-300 bg-primary-50",
                )}
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    privacyMode: "selective",
                  }))
                }
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-primary-600 flex items-center justify-center mt-0.5">
                    {preferences.privacyMode === "selective" && (
                      <div className="w-3 h-3 bg-primary-600 rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">
                      Selective Sharing
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Choose which memories to share with family and friends.
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all",
                  preferences.privacyMode === "family" &&
                    "border-primary-300 bg-primary-50",
                )}
                onClick={() =>
                  setPreferences((prev) => ({ ...prev, privacyMode: "family" }))
                }
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-primary-600 flex items-center justify-center mt-0.5">
                    {preferences.privacyMode === "family" && (
                      <div className="w-3 h-3 bg-primary-600 rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">
                      Family Timeline
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Share memories automatically with family members.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case "ai":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-display font-bold text-neutral-900">
                AI-Powered Features
              </h2>
              <p className="text-neutral-600">
                Let AI help you organize, discover patterns, and create stories
                from your memories.
              </p>
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        aiEnabled: !prev.aiEnabled,
                      }))
                    }
                    className={cn(
                      "w-6 h-6 rounded border-2 flex items-center justify-center",
                      preferences.aiEnabled
                        ? "bg-primary-600 border-primary-600"
                        : "border-neutral-300",
                    )}
                  >
                    {preferences.aiEnabled && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <div>
                    <h3 className="font-medium text-neutral-900">
                      Enable AI Features
                    </h3>
                    <p className="text-sm text-neutral-600 mb-3">
                      Get automatic summaries, smart tagging, and pattern
                      discovery.
                    </p>
                    <ul className="text-sm text-neutral-500 space-y-1">
                      <li>• Automatic photo recognition and tagging</li>
                      <li>• Smart content summaries</li>
                      <li>• Pattern discovery in your memories</li>
                      <li>• Personalized story generation</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {preferences.aiEnabled && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-primary-800 font-medium mb-1">
                        Privacy Protected
                      </p>
                      <p className="text-primary-700">
                        AI processing happens securely and privately. Your data
                        never leaves our encrypted servers.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "tags":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-display font-bold text-neutral-900">
                Choose Your Tags
              </h2>
              <p className="text-neutral-600">
                Select categories that matter to you. You can always add more
                later.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-3 py-2 rounded-full text-sm font-medium border transition-colors",
                      preferences.selectedTags.includes(tag)
                        ? "bg-primary-100 border-primary-300 text-primary-800"
                        : "bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400",
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
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-neutral-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <Card className="p-8 space-y-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
            <Button
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 0 || isSubmitting}
              className="flex items-center"
            >
              <CaretLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={nextStep}
              className="flex items-center"
              disabled={isSubmitting || isUploadingImage}
            >
              {isSubmitting || isUploadingImage ? (
                <>
                  <Spinner className="w-4 h-4 mr-2 animate-spin" />
                  {isUploadingImage ? "Uploading..." : "Saving..."}
                </>
              ) : (
                <>
                  {currentStep === steps.length - 1
                    ? "Complete Setup"
                    : "Continue"}
                  <CaretRight className="w-4 h-4 ml-2" />
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
