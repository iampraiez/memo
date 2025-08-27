"use client";
import React, { useState, useEffect } from "react";
import {
  User as Icon,
  Download,
  Trash2,
  Cloud,
  Palette,
  LogOut,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { sampleUser } from "@/data/sampleData";
import { db, useNetworkStatus, UserSettings } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import MediaUploader from "@/components/ui/MediaUploader";
import { signOut } from "next-auth/react";

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("account");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCodeVerification, setShowCodeVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const isOnline = useNetworkStatus();
  const dbUserSettings =
    useLiveQuery(() => db.userSettings.get("settings"), []) || null;
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    if (dbUserSettings) {
      console.log("from dexie", dbUserSettings);
      return dbUserSettings;
    } else {
      return {
        id: "settings",
        name: sampleUser.name,
        syncStatus: "synced",
        userId: "user-sarah",
        email: sampleUser.email,
        avatar: sampleUser.avatar,
        preferences: sampleUser.preferences,
      };
    }
  });

  // Effect to update local state when dbUserSettings changes
  useEffect(() => {
    if (dbUserSettings) {
      setUserSettings(dbUserSettings);
    } else {
      const defaultSettings: UserSettings = {
        id: "settings",
        userId: sampleUser.id,
        email: sampleUser.email,
        name: sampleUser.name,
        preferences: {
          theme: sampleUser.preferences.theme,
        },
        syncStatus: "synced",
      };
      db.userSettings.put(defaultSettings);
    }
  }, [dbUserSettings]);

  // Timer effect for code verification
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showCodeVerification && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showCodeVerification, timer]);

  const sections = [
    { id: "account", label: "Account", icon: Icon },
    { id: "sync", label: "Sync & Backup", icon: Cloud },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "data", label: "Data & Export", icon: Download },
  ];

  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  const handleSaveSettings = async (updatedSettings: UserSettings) => {
    const finalSettings = {
      ...updatedSettings,
    };
    await db.userSettings.put(finalSettings);
    if (!isOnline) {
      await db.offline_changes.add({
        type: "update",
        collection: "userSettings",
        data: finalSettings,
        timestamp: Date.now(),
      });
    }
    setUserSettings(finalSettings);
    console.log("Settings", finalSettings);
  };

  const handleDeleteRequest = () => {
    setShowDeleteDialog(false);
    setShowCodeVerification(true);
    setTimer(300); // Reset timer to 5 minutes
    setVerificationCode("");
    setCodeError("");
    console.log("Simulating sending verification code to", userSettings.email);
  };

  const handleVerifyCode = () => {
    // Simulate code verification (in real app, this would be an API call)
    const simulatedCorrectCode = "123456"; // Simulated code for testing
    if (verificationCode === simulatedCorrectCode) {
      console.log("Account deleted successfully");
      setShowCodeVerification(false);
      // Simulate redirect
      console.log("Redirecting to / route");
      window.location.href = "/";
    } else {
      setCodeError("Invalid verification code");
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const renderSection = () => {
    switch (activeSection) {
      case "account":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={userSettings.name}
                  onChange={(e) =>
                    setUserSettings((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
                <div>
                  <Input
                    label="Email"
                    value={userSettings.email}
                    disabled
                    onChange={(e) =>
                      setUserSettings((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                  <p className="text-sm text-blue-700 mt-1">
                    Email address cannot be changed
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-3">
                Profile Picture
              </h3>
              <MediaUploader
                label="Upload Profile Picture"
                files={
                  userSettings.avatar
                    ? [
                        {
                          id: "current-avatar",
                          name: "Profile Picture",
                          size: 0,
                          type: "image/*",
                          url: userSettings.avatar,
                        },
                      ]
                    : []
                }
                onFilesChange={(newFiles) => {
                  const newAvatar =
                    newFiles.length > 0 ? newFiles[0].url : undefined;
                  setUserSettings((prev) => ({ ...prev, avatar: newAvatar }));
                }}
                onUpload={async (newFiles) => {
                  if (newFiles.length > 0) {
                    const file = newFiles[0];
                    // Simulate uploading to a backend
                    const imageUrl = URL.createObjectURL(file);
                    setUserSettings((prev) => ({ ...prev, avatar: imageUrl }));
                    console.log("Simulating avatar upload:", file.name);
                  }
                }}
                className="max-w-xs"
                multiple={false}
                maxFiles={1}
              />
            </div>

            <div className="pt-4 border-t border-neutral-200">
              <Button
                onClick={() =>
                  handleSaveSettings({
                    ...userSettings,
                    name: userSettings.name,
                    email: userSettings.email,
                    avatar: userSettings.avatar, // Ensure avatar is saved
                  })
                }
              >
                Save Changes
              </Button>
            </div>
          </div>
        );

      case "sync":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Sync & Backup
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div>
                    <h3 className="font-medium text-blue-900">Auto Backup</h3>
                    <p className="text-sm text-blue-700">
                      All memories are automatically backed up
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      className="sr-only peer"
                      disabled
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Appearance
              </h2>
              <div className="space-y-4">
                <Select
                  label="Theme"
                  options={themeOptions}
                  value={userSettings.preferences.theme}
                  onChange={(value) =>
                    handleSaveSettings({
                      ...userSettings,
                      preferences: {
                        ...userSettings.preferences,
                        theme: value as "light" | "dark" | "system",
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Data & Export
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-neutral-900">
                      Export All Data
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Download all your memories and data
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-destructive-200 rounded-lg bg-destructive-50">
                  <div>
                    <h3 className="font-medium text-destructive-900">
                      Delete Account
                    </h3>
                    <p className="text-sm text-destructive-700">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-fit bg-neutral-50">
      <div className="flex">
        <main className="">
          <div className="p-6 max-w-6xl mx-auto">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-display font-bold text-neutral-900">
                  Settings
                </h1>
                <p className="text-neutral-600 mt-1">
                  Manage your account, privacy, and preferences
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Settings Navigation */}
                <div className="lg:col-span-1">
                  <Card className="p-4">
                    <nav className="space-y-1">
                      {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                              activeSection === section.id
                                ? "bg-primary-100 text-primary-900 border border-primary-200"
                                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{section.label}</span>
                          </button>
                        );
                      })}
                      <button
                        onClick={() => signOut({ redirectTo: "/auth/login" })}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </nav>
                  </Card>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-3">
                  <Card className="p-6">{renderSection()}</Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Account Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteRequest}
        title="Delete Account"
        message="This will permanently delete your account and all your memories. This action cannot be undone."
        confirmLabel="Delete Account"
        variant="destructive"
      />

      {/* Code Verification Dialog */}
      <Modal
        isOpen={showCodeVerification}
        onClose={() => setShowCodeVerification(false)}
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-destructive-100 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6 text-destructive-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-neutral-900">
              Verify Account Deletion
            </h3>
            <p className="text-neutral-600">
              A verification code has been sent to {userSettings.email}. Please
              enter the code below. The code will expire in {formatTime(timer)}.
            </p>
          </div>
          <div className="space-y-4">
            <Input
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
            />
            {codeError && (
              <p className="text-sm text-destructive-600">{codeError}</p>
            )}
            {timer === 0 && (
              <p className="text-sm text-destructive-600">
                The verification code has expired. Please request a new code.
              </p>
            )}
          </div>
          <div className="flex space-x-3 justify-center pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCodeVerification(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleVerifyCode}
              disabled={timer === 0 || verificationCode.length !== 6}
            >
              Verify and Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
