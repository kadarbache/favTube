"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { NAME_MAX_LENGTH, BIO_MAX_LENGTH } from "@/lib/constants";

export function EditProfile({
  name,
  bio,
  username,
}: {
  name: string;
  bio: string | null;
  username: string;
}) {
  const [editing, setEditing] = useState(false);
  const [savedName, setSavedName] = useState(name);
  const [savedBio, setSavedBio] = useState(bio ?? "");
  const [draftName, setDraftName] = useState(name);
  const [draftBio, setDraftBio] = useState(bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onEdit() {
    setDraftName(savedName);
    setDraftBio(savedBio);
    setError(null);
    setEditing(true);
  }

  function onCancel() {
    setError(null);
    setEditing(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateProfile(draftName, draftBio, username);
      if (result.ok) {
        setSavedName(draftName.trim());
        setSavedBio(draftBio.trim());
        setEditing(false);
      } else {
        setError(result.error);
      }
    });
  }

  if (!editing) {
    return (
      <div className="flex flex-[1_1_320px] flex-col gap-2.5">
        <h1 className="text-[28px] font-semibold tracking-tight">{savedName}</h1>
        {savedBio ? (
          <p className="max-w-[520px] text-[15px] leading-relaxed text-[var(--gray-700)]">
            {savedBio}
          </p>
        ) : (
          <p className="max-w-[520px] text-[15px] italic text-muted">
            Add a bio to tell people about your top ten.
          </p>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="self-start text-[12.5px] font-medium text-muted transition-colors hover:text-foreground"
        >
          Edit profile
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex max-w-[520px] flex-[1_1_320px] flex-col gap-2.5"
    >
      <input
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        maxLength={NAME_MAX_LENGTH}
        placeholder="Name"
        className="rounded-[var(--radius)] border border-border bg-background px-3.5 py-2 text-[17px] font-semibold outline-none transition-colors focus:border-[var(--gray-300)]"
      />
      <textarea
        value={draftBio}
        onChange={(e) => setDraftBio(e.target.value)}
        maxLength={BIO_MAX_LENGTH}
        rows={3}
        placeholder="Add a bio to tell people about your top ten…"
        className="resize-none rounded-[var(--radius)] border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--gray-300)]"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || !draftName.trim()}
          className="rounded-[var(--radius)] bg-primary px-4 py-2 text-[13px] font-medium text-[var(--primary-foreground)] transition-colors enabled:hover:bg-[var(--primary-hover)] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="text-[12.5px] font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
        >
          Cancel
        </button>
        <span className="ml-auto text-[12px] text-muted">
          {draftBio.length}/{BIO_MAX_LENGTH}
        </span>
      </div>
      {error && <p className="text-[12.5px] text-primary">{error}</p>}
    </form>
  );
}
