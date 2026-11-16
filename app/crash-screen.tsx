"use client";

type CrashScreenProps = {
  onRestart: () => void;
};

const CrashScreen = ({ onRestart }: CrashScreenProps) => (
  <main
    role="alert"
    className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-black px-6 text-center text-neutral-100"
  >
    <svg className="size-12 fill-neutral-400" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v7h-2V7Zm1 9a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
    </svg>
    <h1 className="m-0 text-xl font-semibold">Your desktop needs to restart.</h1>
    <p className="m-0 max-w-sm text-sm text-neutral-400">
      Something went wrong while loading the portfolio. Restarting usually fixes it.
    </p>
    <button
      type="button"
      onClick={onRestart}
      className="mt-2 cursor-pointer rounded-lg border-0 bg-white px-5 py-2 text-sm font-medium text-black hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      Restart
    </button>
  </main>
);

export default CrashScreen;
