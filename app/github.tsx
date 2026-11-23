"use client";

import { useEffect, useRef, useState } from "react";

const GITHUB_USERNAME = "asierbayon";
export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;
const CONTRIBUTIONS_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`;
const REFRESH_MS = 30 * 60 * 1000;
const CELL = 10;
const GAP = 3;
const STEP = CELL + GAP;
const SKELETON_WEEKS = 53;
const LEVEL_COLORS = ["#30363d", "#0e4429", "#006d32", "#26a641", "#39d353"] as const;
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type GitHubStatus = "loading" | "ready" | "error" | "offline";

type ContributionDay = {
  date: string;
  count: number;
  level: number;
};

type ContributionWeek = {
  days: Array<ContributionDay | null>;
};

type MonthLabel = {
  index: number;
  name: string;
};

export type GitHubContributions = {
  total: number;
  weeks: ContributionWeek[];
};

type GitHubWidgetProps = {
  contributions: GitHubContributions | null;
  status: GitHubStatus;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readUtcDate = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
};

const clampLevel = (level: number) => {
  if (level <= 0) return 0;
  if (level >= LEVEL_COLORS.length - 1) return LEVEL_COLORS.length - 1;
  return Math.round(level);
};

const emptyWeek = (): Array<ContributionDay | null> => [null, null, null, null, null, null, null];

const buildWeeks = (days: ContributionDay[]) => {
  const weeks: ContributionWeek[] = [];
  const indexBySunday = new Map<string, number>();

  days.forEach((day) => {
    const date = readUtcDate(day.date);
    const weekday = date.getUTCDay();
    date.setUTCDate(date.getUTCDate() - weekday);
    const sunday = date.toISOString().slice(0, 10);
    let index = indexBySunday.get(sunday);
    if (index === undefined) {
      index = weeks.length;
      indexBySunday.set(sunday, index);
      weeks.push({ days: emptyWeek() });
    }
    weeks[index].days[weekday] = day;
  });

  return weeks;
};

const readMonthLabels = (weeks: ContributionWeek[]) => {
  const labels: MonthLabel[] = [];

  weeks.forEach((week, index) => {
    const firstOfMonth = week.days.find((day) => {
      if (!day) return false;
      return readUtcDate(day.date).getUTCDate() === 1;
    });
    if (!firstOfMonth) return;

    const date = readUtcDate(firstOfMonth.date);
    const labelIndex = date.getUTCDay() > 3 ? index + 1 : index;
    if (labelIndex >= weeks.length) return;

    const previous = labels[labels.length - 1];
    if (previous && labelIndex - previous.index < 2) return;

    labels.push({
      index: labelIndex,
      name: MONTH_NAMES[date.getUTCMonth()],
    });
  });

  return labels;
};

const readContributionDay = (value: unknown): ContributionDay | null => {
  if (!isRecord(value)) return null;
  if (typeof value.date !== "string") return null;
  if (typeof value.count !== "number" || !Number.isFinite(value.count)) return null;
  if (typeof value.level !== "number" || !Number.isFinite(value.level)) return null;
  return {
    date: value.date,
    count: value.count,
    level: clampLevel(value.level),
  };
};

const parseContributions = (payload: unknown): GitHubContributions | null => {
  if (!isRecord(payload)) return null;
  if (!isRecord(payload.total)) return null;
  if (typeof payload.total.lastYear !== "number" || !Number.isFinite(payload.total.lastYear)) {
    return null;
  }
  if (!Array.isArray(payload.contributions)) return null;

  const days: ContributionDay[] = [];
  payload.contributions.forEach((entry) => {
    const day = readContributionDay(entry);
    if (!day) return;
    days.push(day);
  });
  if (days.length === 0) return null;

  return {
    total: payload.total.lastYear,
    weeks: buildWeeks(days),
  };
};

const formatDayLabel = (day: ContributionDay) => {
  const formatted = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(readUtcDate(day.date));
  if (day.count === 0) return `No contributions on ${formatted}`;
  if (day.count === 1) return `1 contribution on ${formatted}`;
  return `${day.count} contributions on ${formatted}`;
};

const formatTotal = (total: number) => {
  const formatted = total.toLocaleString("en-US");
  if (total === 1) return `${formatted} contribution in the last year`;
  return `${formatted} contributions in the last year`;
};

const skeletonWeeks = () =>
  Array.from({ length: SKELETON_WEEKS }, () => ({ days: emptyWeek() }));

export const useGitHubContributions = (isOffline: boolean) => {
  const [contributions, setContributions] = useState<GitHubContributions | null>(null);
  const [status, setStatus] = useState<GitHubStatus>("loading");
  const contributionsRef = useRef<GitHubContributions | null>(null);

  useEffect(() => {
    contributionsRef.current = contributions;
  }, [contributions]);

  useEffect(() => {
    if (isOffline) {
      if (!contributionsRef.current) setStatus("offline");
      return;
    }
    if (!contributionsRef.current) setStatus("loading");

    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(CONTRIBUTIONS_URL, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("contributions failed");
        const next = parseContributions(await response.json());
        if (!next) throw new Error("contributions invalid");
        if (cancelled) return;
        setContributions(next);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (contributionsRef.current) return;
        setStatus("error");
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      void load();
    };

    void load();
    const interval = window.setInterval(() => {
      void load();
    }, REFRESH_MS);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isOffline]);

  return { contributions, status };
};

const GitHubMark = () => (
  <svg className="gh-mark" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const ContributionLegend = () => (
  <span className="gh-legend" aria-hidden="true">
    <span>Less</span>
    {LEVEL_COLORS.map((color) => (
      <span key={color} className="gh-legend-cell" style={{ background: color }} />
    ))}
    <span>More</span>
  </span>
);

const readCaption = (status: GitHubStatus, total: number | null) => {
  if (status === "loading") return "Loading contributions";
  if (status === "offline") return "You're offline";
  if (status !== "ready" || total === null) return "Contributions unavailable";
  if (total === 1) return "contribution in the last year";
  return "contributions in the last year";
};

const readTotal = (status: GitHubStatus, total: number | null) => {
  if (status !== "ready" || total === null) return "—";
  return total.toLocaleString("en-US");
};

const plotWidth = (weekCount: number) => weekCount * STEP - GAP;

const ContributionGraph = ({
  weeks,
  isPlaceholder,
}: {
  weeks: ContributionWeek[];
  isPlaceholder: boolean;
}) => {
  const width = plotWidth(weeks.length);
  const height = 7 * STEP - GAP;
  const labels = isPlaceholder ? [] : readMonthLabels(weeks);

  return (
    <div className="gh-plot">
      <div className="gh-months" aria-hidden="true">
        {labels.map((label) => (
          <span
            key={`${label.name}-${label.index}`}
            style={{ left: `${(label.index * STEP * 100) / width}%` }}
          >
            {label.name}
          </span>
        ))}
      </div>
      <svg
        className="gh-graph"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMinYMin meet"
        aria-hidden="true"
      >
        {weeks.map((week, column) =>
          week.days.map((day, row) => {
            if (!day && !isPlaceholder) return null;
            const level = day ? clampLevel(day.level) : 0;
            return (
              <rect
                key={day?.date ?? `${column}-${row}`}
                x={column * STEP}
                y={row * STEP}
                width={CELL}
                height={CELL}
                rx={2}
                style={{ fill: LEVEL_COLORS[level] }}
              >
                {day ? <title>{formatDayLabel(day)}</title> : null}
              </rect>
            );
          }),
        )}
      </svg>
    </div>
  );
};

const GitHubWidget = ({ contributions, status }: GitHubWidgetProps) => {
  const weeks = contributions?.weeks ?? skeletonWeeks();
  const isPlaceholder = status !== "ready" || contributions === null;
  const summary = contributions ? formatTotal(contributions.total) : "GitHub contributions";
  const rootClass = ["gh-widget"];
  if (status === "loading") rootClass.push("is-loading");

  return (
    <section className={rootClass.join(" ")} aria-label={summary}>
      <div className="gh-head">
        <div className="gh-top">
          <p className="gh-place">
            <GitHubMark />
            {GITHUB_USERNAME}
          </p>
          <p className="gh-total">{readTotal(status, contributions?.total ?? null)}</p>
        </div>
        <div className="gh-meta">
          {status === "ready" && contributions ? <ContributionLegend /> : null}
          <p className="gh-caption">{readCaption(status, contributions?.total ?? null)}</p>
        </div>
      </div>
      <ContributionGraph weeks={weeks} isPlaceholder={isPlaceholder} />
    </section>
  );
};

export default GitHubWidget;
