import { formatDuration } from "@/lib/utils/format";
import { youtubeEmbedUrl } from "@/lib/youtube";
import { HeroVideoDialog } from "@/registry/magicui/hero-video-dialog";

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
    <div className="flex flex-col gap-2.5">
      <HeroVideoDialog
        animationStyle="from-center"
        videoSrc={youtubeEmbedUrl(video.youtubeVideoId)}
        thumbnailSrc={video.thumbnailUrl}
        thumbnailAlt={video.title}
      >
        <span className="pointer-events-none absolute left-1.5 top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-[3px] bg-white/95 px-1.5 text-[11.5px] font-bold text-[#0f0f0f]">
          {video.rank}
        </span>
        {duration && (
          <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded-[3px] bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {duration}
          </span>
        )}
      </HeroVideoDialog>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13.5px] font-semibold leading-tight">
          {video.title}
        </span>
        <span className="text-[12.5px] text-muted">{video.channelName}</span>
      </div>
    </div>
  );
}
