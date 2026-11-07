"use client";

import DitherBackground from "./dither-background";
import HomeIndicatorSpacer from "./home-indicator-spacer";

const sectionTitleClassName = "mb-4 text-[17px] font-medium leading-tight tracking-[-0.03em]";
const bodyClassName = "m-0 text-[12px] leading-[1.8] text-[#1d2d4e]/75";

const CitizenXOverview = () => (
  <article className="citizenx-site font-[family-name:var(--font-geist-mono)]" aria-label="About CitizenX">
    <DitherBackground
      src="/asier/citizenx-vision.jpg"
      gridSize={2}
      mobileGridSize={1}
      primaryColor="#1d2d4e"
      secondaryColor="#fffcf8"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07] [mask-image:linear-gradient(to_bottom,transparent,#000_45%)] max-[700px]:[mask-image:linear-gradient(to_bottom,transparent,#000_70%)] forced-colors:hidden"
    />

    <div className="citizenx-scroll relative">
      <div className="mx-auto flex max-w-[560px] flex-col gap-12 px-8 py-14">
        <header className="flex flex-col gap-5">
          <h2 className="m-0 text-[clamp(26px,6cqi,38px)] font-medium leading-[1.1] tracking-[-0.04em]">
            The Citizenship Company.
          </h2>
          <p className={bodyClassName}>
            CitizenX is a technology company and concierge service that helps high-net-worth individuals and their
            families diversify their passport portfolio through citizenship by investment and descent programs.
          </p>
        </header>

        <section aria-labelledby="cx-why-title">
          <h3 id="cx-why-title" className={sectionTitleClassName}>
            Citizenship as a service.
          </h3>
          <div className="flex flex-col gap-3">
            <p className={bodyClassName}>
              We believe citizenship is the keystone of a sovereign strategy: it gives you and your future generations
              long-term optionality, stability, and a safe haven when conditions change.
            </p>
            <p className={bodyClassName}>
              Countries are service providers. The right citizenship is the one that serves your goals, whether you
              qualify through investment, ancestry, or exceptional achievements.
            </p>
          </div>
        </section>

        <section aria-labelledby="cx-role-title">
          <h3 id="cx-role-title" className={sectionTitleClassName}>
            What I do.
          </h3>
          <p className={bodyClassName}>
            I&apos;m Chief Product Officer at CitizenX. I bring product, design, and engineering together to make a complex
            citizenship journey feel clear and approachable, from the first eligibility check to a new passport.
          </p>
        </section>

        <a
          href="https://citizenx.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="More about CitizenX (opens in a new tab)"
          className="self-start text-[12px] font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2d4e]"
        >
          More about CitizenX <span aria-hidden="true">↗</span>
        </a>
      </div>
      <HomeIndicatorSpacer />
    </div>
  </article>
);

export default CitizenXOverview;
