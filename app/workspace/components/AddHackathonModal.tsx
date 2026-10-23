"use client";

import { useState } from "react";

export interface HackathonRecord {
  id: string;
  name: string;
  organizer: string;
  mode: string;
  status: string;
  statusType: "urgent" | "forming" | "idea" | "registered";
  dates: string;
  remainingDays: number;
  deadlineText: string;
  description: string;
  teamName: string;
  teamCount: string;
  tags?: string[];
}

interface AddHackathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (hackathon: HackathonRecord) => void;
}

export default function AddHackathonModal({
  isOpen,
  onClose,
  onAdd,
}: AddHackathonModalProps) {
  const [name, setName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [mode, setMode] = useState("Online / Global");
  const [dates, setDates] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRecord: HackathonRecord = {
      id: "hack-" + Date.now(),
      name: name.trim(),
      organizer: organizer.trim() || "Global Community",
      mode: mode,
      status: "Registered & Ready",
      statusType: "registered",
      dates: dates.trim() || "TBD 2025",
      remainingDays: 14,
      deadlineText: deadline.trim() || "Registration open",
      description:
        description.trim() ||
        "Building innovative full-stack application and competing for top prize pools.",
      teamName: "Team NovaLogic",
      teamCount: "1/4",
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    onAdd(newRecord);
    onClose();
    // Reset form
    setName("");
    setOrganizer("");
    setDates("");
    setDeadline("");
    setDescription("");
    setTags("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-surface-container border border-outline-variant/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-high/60">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              add_circle
            </span>
            <h3 className="text-lg font-bold text-on-surface">
              Add New Hackathon Record
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-highest transition-colors"
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
                Mode
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
                Sprint Dates
              </label>
              <input
                type="text"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                placeholder="e.g. Dec 10 - Dec 14, 2025"
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                Registration Deadline
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. Dec 05, 2025"
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
                placeholder="e.g. AI, Rust, Next.js"
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

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-container text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all shadow-[0_0_12px_rgba(160,120,255,0.4)]"
            >
              Save Hackathon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
