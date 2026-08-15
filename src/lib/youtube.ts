export type YoutubeVideoMetadata = {
  youtubeVideoId: string;
  url: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  durationSeconds: number;
};

const VIDEO_ID_PATTERN = /^[\w-]{11}$/;

export function parseYoutubeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (VIDEO_ID_PATTERN.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  const segments = url.pathname.split("/").filter(Boolean);

  let candidate: string | undefined;
  if (host === "youtu.be") {
    candidate = segments[0];
  } else if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    if (segments[0] === "watch") {
      candidate = url.searchParams.get("v") ?? undefined;
    } else if (["shorts", "embed", "v", "live"].includes(segments[0])) {
      candidate = segments[1];
    }
  }

  return candidate && VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
}

// `playsinline` is what keeps the player in our overlay on iOS — without it
// Safari ejects into its own fullscreen player, which offers its own way out to
// the YouTube app. `rel=0` keeps end-screen suggestions on the same channel.
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`;
}

// ISO 8601 durations from the Data API look like PT4M13S / PT1H2M3S / P1DT2H.
export function parseIsoDuration(iso: string | undefined | null): number {
  if (!iso) return 0;
  const match =
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(iso);
  if (!match) return 0;
  const [, days, hours, minutes, seconds] = match;
  return (
    Number(days ?? 0) * 86400 +
    Number(hours ?? 0) * 3600 +
    Number(minutes ?? 0) * 60 +
    Math.floor(Number(seconds ?? 0))
  );
}

type YoutubeApiResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
      channelTitle?: string;
      thumbnails?: Record<string, { url?: string }>;
    };
    contentDetails?: { duration?: string };
  }>;
};

function pickThumbnail(
  thumbnails: Record<string, { url?: string }> | undefined,
): string {
  const preference = ["maxres", "standard", "high", "medium", "default"];
  for (const key of preference) {
    const url = thumbnails?.[key]?.url;
    if (url) return url;
  }
  return "";
}

export class YoutubeLookupError extends Error {}

export async function fetchVideoMetadata(
  videoId: string,
): Promise<YoutubeVideoMetadata> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new YoutubeLookupError("YouTube API key is not configured.");
  }

  const endpoint = new URL("https://www.googleapis.com/youtube/v3/videos");
  endpoint.searchParams.set("part", "snippet,contentDetails");
  endpoint.searchParams.set("id", videoId);
  endpoint.searchParams.set("key", apiKey);

  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) {
    throw new YoutubeLookupError("Could not reach YouTube right now.");
  }

  const data = (await response.json()) as YoutubeApiResponse;
  const item = data.items?.[0];
  if (!item) {
    throw new YoutubeLookupError(
      "That video could not be found — it may be private or deleted.",
    );
  }

  return {
    youtubeVideoId: videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    title: item.snippet?.title ?? "Untitled",
    channelName: item.snippet?.channelTitle ?? "Unknown channel",
    thumbnailUrl:
      pickThumbnail(item.snippet?.thumbnails) ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    durationSeconds: parseIsoDuration(item.contentDetails?.duration),
  };
}
