"use client";

import { useState, useEffect } from "react";
import { uploadHackathonBanner } from "../../../lib/firebase/storage";

export interface HackathonRecord {
  id: string;
  name: string;
  organizer: string;
  mode: string;
  status: string;
  statusType: "urgent" | "forming" | "idea" | "registered";
  dates: string;
  location?: string;
  college?: string;
  remainingDays: number;
  deadlineText: string;
  description: string;
  teamName: string;
  teamCount: string;
  bannerUrl?: string;
  tags?: string[];
}

export function calculateDaysRemaining(dateStr: string): number {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

interface AddHackathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (hackathon: HackathonRecord) => void;
  onAdd?: (hackathon: HackathonRecord) => void;
  onDelete?: (id: string) => void;
  activeTeamName?: string;
  initialData?: HackathonRecord | null;
}

export default function AddHackathonModal({
  isOpen,
  onClose,
  onSave,
  onAdd,
  onDelete,
  activeTeamName,
  initialData,
}: AddHackathonModalProps) {
  const [name, setName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [college, setCollege] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("Online / Global");
  const [status, setStatus] = useState("Registered & Ready");
  const [statusType, setStatusType] = useState<"urgent" | "forming" | "idea" | "registered">("registered");
  const [dates, setDates] = useState("");
  const [deadline, setDeadline] = useState("");
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setOrganizer(initialData.organizer || "");
      setCollege(initialData.college || "");
      setLocation(initialData.location || "");
      setMode(initialData.mode || "Online / Global");
      setStatus(initialData.status || "Registered & Ready");
      setStatusType(initialData.statusType || "registered");
      setDates(initialData.dates || "");
      setDeadline(initialData.deadlineText?.replace("Deadline: ", "") || "");
      setTeamName(initialData.teamName || activeTeamName || "Solo Squad");
      setDescription(initialData.description || "");
      setTags(initialData.tags?.join(", ") || "");
      setBannerUrl(initialData.bannerUrl || "");
    } else {
      setName("");
      setOrganizer("");
      setCollege("");
      setLocation("");
      setMode("Online / Global");
      setStatus("Registered & Ready");
      setStatusType("registered");
      setDates("");
      setDeadline("");
      setTeamName(activeTeamName || "Solo Squad");
      setDescription("");
      setTags("");
      setBannerUrl("");
    }
  }, [initialData, isOpen, activeTeamName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const computedDays = calculateDaysRemaining(dates);

    const record: HackathonRecord = {
      id: initialData?.id || "hack-" + Date.now(),
      name: name.trim(),
      organizer: organizer.trim() || "Global Community",
      mode: mode,
      status: status.trim() || "Registered & Ready",
      statusType: statusType,
      dates: dates.trim() || "TBD 2026",
      location: location.trim() || "",
      college: college.trim() || "",
      remainingDays: computedDays,
      deadlineText: deadline.trim()
        ? `Deadline: ${deadline.trim()}`
        : computedDays > 0
        ? `Starts in ${computedDays} days`
        : computedDays === 0
        ? "Happening today!"
        : "Event concluded",
      description:
        description.trim() ||
        "Building innovative full-stack application and competing for top prize pools.",
      teamName: teamName.trim() || activeTeamName || "Solo Squad",
      teamCount: initialData?.teamCount || "1/4",
      bannerUrl: bannerUrl.trim() || "",
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (onSave) {
      onSave(record);
    } else if (onAdd) {
      onAdd(record);
    }

    onClose();
  };

  const handleDelete = () => {
    if (!initialData || !onDelete) return;
    onDelete(initialData.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-surface-container border border-outline-variant/40 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-high/60">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              {isEditing ? "edit_calendar" : "add_circle"}
            </span>
            <h3 className="text-lg font-bold text-on-surface">
              {isEditing ? "Update Hackathon Record" : "Add New Hackathon Record"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                Hackathon Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Solana Summer Camp"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                Organizer
              </label>
              <input
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. Solana Foundation"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                Participation Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              >
                <option value="Online / Global">Online / Global</option>
                <option value="Hybrid (In-Person + Virtual)">
                  Hybrid (In-Person + Virtual)
                </option>
                <option value="In-Person Only">In-Person Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                Competition Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value;
                  setStatus(val);
                  if (val.includes("Active") || val.includes("Sprinting")) {
                    setStatusType("urgent");
                  } else if (val.includes("Review") || val.includes("Draft")) {
                    setStatusType("forming");
                  } else {
                    setStatusType("registered");
                  }
                }}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              >
                <option value="Registered & Ready">Registered &amp; Ready</option>
                <option value="Sprint Active (Hacking)">Sprint Active (Hacking)</option>
                <option value="Submission Drafted">Submission Drafted</option>
                <option value="Submitted / In Review">Submitted / In Review</option>
                <option value="Podium Finish / Winner">Podium Finish / Winner</option>
                <option value="Completed / Archived">Completed / Archived</option>
              </select>
            </div>
          </div>

          {/* College & Place Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                College / University / Host Institution *
              </label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Stanford University or MIT"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                Place / Venue / City *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main Auditorium, Campus or Online Discord"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Event Date & Registration Deadline Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono uppercase tracking-wider text-outline">
                  Hackathon Held On (Event Date) *
                </label>
                {dates && (
                  <span className="text-[10px] font-mono text-primary font-bold">
                    {calculateDaysRemaining(dates) > 1
                      ? `${calculateDaysRemaining(dates)} days away`
                      : calculateDaysRemaining(dates) === 1
                      ? "Starts tomorrow!"
                      : calculateDaysRemaining(dates) === 0
                      ? "Happening today!"
                      : "Past event"}
                  </span>
                )}
              </div>
              <input
                type="date"
                required
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                Registration Deadline (Optional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                Assigned Squad / Team
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Solo Squad"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                Tech Focus / Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. AI, Next.js, Rust"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
              Project Vision / Target Architecture
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you building with your squad for this hackathon?"
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Firebase Storage Graphic / Banner */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-outline">
                Hackathon Banner / Poster (Firebase Storage)
              </label>
              {uploadingBanner && (
                <span className="text-[11px] font-mono text-primary flex items-center gap-1 animate-pulse">
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Uploading to Cloud...
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingBanner(true);
                  try {
                    const downloadUrl = await uploadHackathonBanner(
                      initialData?.id || "hack-" + Date.now(),
                      file
                    );
                    setBannerUrl(downloadUrl);
                  } catch (err) {
                    console.error("Banner upload error:", err);
                  } finally {
                    setUploadingBanner(false);
                  }
                }}
                className="w-full text-xs text-outline file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary hover:file:text-on-primary cursor-pointer transition-colors"
              />

              {bannerUrl && (
                <div className="w-full h-24 rounded-xl overflow-hidden border border-outline-variant/30 relative group">
                  <img
                    src={bannerUrl}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setBannerUrl("")}
                    className="absolute top-2 right-2 p-1 rounded-md bg-background/80 hover:bg-error text-on-surface hover:text-on-error text-xs backdrop-blur-sm transition-colors cursor-pointer"
                    title="Remove graphic"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-error hover:bg-error/10 border border-error/30 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                <span>Delete</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-container text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all shadow-[0_0_12px_rgba(160,120,255,0.4)] cursor-pointer"
              >
                {isEditing ? "Update Hackathon" : "Save Hackathon"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
