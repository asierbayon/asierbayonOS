// Keep in sync with the `mobile` and `desktop` variants in globals.css.
export const MOBILE_MEDIA_QUERY = "(width <= 700px)";

export const isMobileViewport = () =>
  typeof window !== "undefined" && window.matchMedia(MOBILE_MEDIA_QUERY).matches;

export const isDesktopViewport = () => !isMobileViewport();
