"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  addVideoEntry,
  removeVideoEntry,
  reorderVideoEntries,
} from "@/lib/actions/video-entries";
import { MAX_ENTRIES } from "@/lib/constants";
import { formatDuration } from "@/lib/utils/format";
import type { VideoCardData } from "@/components/profile/video-card";

function SortableRow({
  video,
  index,
  onRemove,
  busy,
}: {
  video: VideoCardData;
  index: number;
  onRemove: (id: string) => void;
  busy: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: video.id });
  const duration = formatDuration(video.durationSeconds);
  const [thumbLoaded, setThumbLoaded] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-[var(--radius)] border border-border bg-background p-2.5 ${
        isDragging ? "z-10 shadow-[var(--shadow-card)]" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab px-1 text-muted transition-colors hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="1.6" />
          <circle cx="15" cy="6" r="1.6" />
          <circle cx="9" cy="12" r="1.6" />
          <circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="18" r="1.6" />
          <circle cx="15" cy="18" r="1.6" />
        </svg>
      </button>

      <span className="w-5 shrink-0 text-center text-[13px] font-bold text-muted">
        {index + 1}
      </span>

      <div className="relative h-[45px] w-20 shrink-0 overflow-hidden rounded-[var(--radius)] bg-subtle">
        {!thumbLoaded && (
          <div className="absolute inset-0 animate-pulse bg-[var(--gray-200)]" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnailUrl}
          alt=""
          onLoad={() => setThumbLoaded(true)}
          className={`h-full w-full object-cover transition-opacity ${
            thumbLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        {duration && (
          <span className="absolute bottom-0.5 right-0.5 rounded-[3px] bg-black/80 px-1 text-[9px] font-medium text-white">
            {duration}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13.5px] font-semibold">
          {video.title}
        </span>
        <span className="truncate text-[12px] text-muted">
          {video.channelName}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onRemove(video.id)}
        disabled={busy}
        className="shrink-0 px-2 text-[12.5px] text-muted transition-colors enabled:hover:text-primary disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}

export function ManageTopTen({ initialVideos }: { initialVideos: VideoCardData[] }) {
  const [videos, setVideos] = useState(initialVideos);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = videos.findIndex((v) => v.id === active.id);
    const newIndex = videos.findIndex((v) => v.id === over.id);
    const next = arrayMove(videos, oldIndex, newIndex);
    setVideos(next);

    startTransition(async () => {
      const result = await reorderVideoEntries(next.map((v) => v.id));
      if (!result.ok) {
        setVideos(videos);
        setError(result.error);
      }
    });
  }

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = url;
    startTransition(async () => {
      const result = await addVideoEntry(value);
      if (result.ok) {
        setUrl("");
        setVideos((prev) => [...prev, result.video]);
      } else {
        setError(result.error);
      }
    });
  }

  function onRemove(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removeVideoEntry(id);
      if (!result.ok) setError(result.error);
    });
  }

  const full = videos.length >= MAX_ENTRIES;

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onAdd} className="flex flex-wrap gap-2.5">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={
            full
              ? "Your top ten is full — remove one to add another"
              : "Paste a YouTube link…"
          }
          disabled={full || pending}
          className="min-w-[240px] flex-1 rounded-[var(--radius)] border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--gray-300)] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={full || pending || !url.trim()}
          className="rounded-[var(--radius)] bg-primary px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors enabled:hover:bg-[var(--primary-hover)] disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </form>

      {error && <p className="text-sm text-primary">{error}</p>}

      {videos.length === 0 ? (
        <p className="rounded-[var(--radius)] border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          No videos yet. Paste a YouTube link above to start your top ten.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={videos.map((v) => v.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {videos.map((video, index) => (
                <SortableRow
                  key={video.id}
                  video={video}
                  index={index}
                  onRemove={onRemove}
                  busy={pending}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <p className="text-[12.5px] text-muted">
        {videos.length} of {MAX_ENTRIES} slots used · drag to reorder
      </p>
    </div>
  );
}
