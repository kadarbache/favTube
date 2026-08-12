import { formatDuration } from "@/lib/utils/format";

export type VideoCardData = {
  id: string;
  rank: number;
  youtubeVideoId: string;
  url: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  durationSeconds: number;
};

export function VideoCard({ video }: { video: VideoCardData }) {
  const duration = formatDuration(video.durationSeconds);
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex cursor-pointer flex-col gap-2.5 transition-opacity hover:opacity-90"
    >
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[var(--radius)] bg-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnailUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute left-1.5 top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-[3px] bg-white/95 px-1.5 text-[11.5px] font-bold text-[#0f0f0f]">
          {video.rank}
        </span>
        {duration && (
          <span className="absolute bottom-1.5 right-1.5 rounded-[3px] bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {duration}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13.5px] font-semibold leading-tight">
          {video.title}
        </span>
        <span className="text-[12.5px] text-muted">{video.channelName}</span>
      </div>
    </a>
  );
}
