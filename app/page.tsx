"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Project = {
  id: string;
  title: string;
  label: string;
  category: string;
  description: string;
  overview: string;
  challenge: string;
  direction: string;
  outcome: string;
  image: string;
  position: { left: string; top: string };
};

const projects: Project[] = [
  {
    id: "noir",
    title: "Noir Leather Collection",
    label: "Noir Leather Coll...",
    category: "Brand Identity",
    description: "A heritage leather house, stripped to silhouette and shadow.",
    overview:
      "Identity, lookbook, and campaign system for a small-batch leather house cutting jackets in a converted Florentine workshop. Built around a single high-contrast silhouette and a wordmark sharp enough to stamp into hide.",
    challenge: "Sell craft without lapsing into nostalgia. The category is crowded with brown patina and serif logos.",
    direction: "Black on white. One jacket, one mark, one story per drop. A typographic system that lets the leather do the talking.",
    outcome: "Sell-through on the launch jacket inside 11 days. Wholesale orders from three independent boutiques in Tokyo and Paris.",
    image: "/atelier/projects/noir-leather.jpg",
    position: { left: "7.8%", top: "13.8%" },
  },
  {
    id: "kestrel",
    title: "Kestrel Outerwear FW",
    label: "Kestrel Outerwea...",
    category: "Campaign",
    description: "Technical outerwear seen through heat, haze, and hard light.",
    overview: "Seasonal art direction and digital launch for an independent outerwear label. The system pairs documentary portraiture with a deliberately synthetic orange glow.",
    challenge: "Give a practical collection a point of view without losing the clarity customers expect from technical clothing.",
    direction: "Monumental portraits, architectural geometry, and a single flare of orange that follows the collection across every format.",
    outcome: "The campaign became Kestrel's strongest launch to date and established the visual system for two following seasons.",
    image: "/atelier/projects/kestrel-outerwear.jpg",
    position: { left: "21.8%", top: "22%" },
  },
  {
    id: "lume",
    title: "Lume Eyewear Launch",
    label: "Lume Eyewear La...",
    category: "Art Direction",
    description: "An optical identity built from reflection, precision, and restraint.",
    overview: "Launch campaign and product system for Lume's first acetate collection, from still-life direction to an adaptable retail toolkit.",
    challenge: "Make quiet product photography feel unmistakable in a category dominated by faces and lifestyle imagery.",
    direction: "Warm neutrals, cropped reflections, and exacting negative space put the object—and its construction—at the center.",
    outcome: "A modular campaign used across 18 retail partners and Lume's most-saved social launch of the year.",
    image: "/atelier/projects/lume-eyewear.jpg",
    position: { left: "38%", top: "11.8%" },
  },
  {
    id: "pulp",
    title: "Pulp Cold-Press Identity",
    label: "Pulp Cold-Press I...",
    category: "Packaging",
    description: "A juice identity with nothing to hide but the peel.",
    overview: "Naming, packaging, and launch imagery for a small cold-press bar focused on familiar produce and radical freshness.",
    challenge: "Stand out on shelf without joining the category's familiar wellness clichés and pastel palettes.",
    direction: "Macro fruit studies, blunt naming, and labels that behave more like produce stickers than luxury packaging.",
    outcome: "The launch range sold through its first production run in three weeks and expanded to six independent grocers.",
    image: "/atelier/projects/pulp-press.jpg",
    position: { left: "55.5%", top: "18%" },
  },
  {
    id: "solenne",
    title: "Solenne Womenswear",
    label: "Solenne Womens...",
    category: "Editorial",
    description: "A soft-spoken collection photographed with architectural poise.",
    overview: "Seasonal campaign, lookbook, and wholesale materials for a Copenhagen womenswear studio working in limited natural-fiber runs.",
    challenge: "Express material quality and cut without making the work feel precious or remote.",
    direction: "A restrained sand palette, candid gestures, and furniture used as line, balance, and quiet punctuation.",
    outcome: "The campaign supported Solenne's first international wholesale season and a feature in three independent fashion titles.",
    image: "/atelier/projects/solenne-womenswear.jpg",
    position: { left: "72.2%", top: "26%" },
  },
  {
    id: "quiet",
    title: "Quiet Quarterly · Issue 04",
    label: "Quiet Quarterly · I...",
    category: "Editorial Design",
    description: "A journal about people, process, and the productive pause.",
    overview: "Editorial design and image direction for the fourth issue of Quiet Quarterly, a journal devoted to slower creative practice.",
    challenge: "Create rhythm across long reads while leaving enough space for the issue's intimate black-and-white photography.",
    direction: "A generous grid, low-contrast typography, and pacing that moves between close portraiture and near-empty pages.",
    outcome: "Issue 04 became the publication's first sold-out edition and was shortlisted for an independent publishing award.",
    image: "/atelier/projects/quiet-quarterly.jpg",
    position: { left: "13.8%", top: "37.5%" },
  },
  {
    id: "bloom",
    title: "Bloom Sneaker Campaign",
    label: "Bloom Sneaker C...",
    category: "Campaign",
    description: "A trail shoe launch where performance meets full bloom.",
    overview: "Global digital campaign for a new trail silhouette, photographed low to the ground among wildflowers and sun-warmed rock.",
    challenge: "Communicate performance credentials without relying on the category's familiar mud, grit, and race-day urgency.",
    direction: "Optimism over aggression: saturated landscape, playful scale, and movement that feels exploratory rather than competitive.",
    outcome: "The launch film reached 2.1m organic views and the hero colorway sold out during its first weekend.",
    image: "/atelier/projects/bloom-sneaker.jpg",
    position: { left: "29.8%", top: "45.5%" },
  },
  {
    id: "kew",
    title: "Kew Botanical Skincare",
    label: "Kew Botanical Sk...",
    category: "Brand World",
    description: "Botanical science, made visible one drop at a time.",
    overview: "Still-life art direction and a flexible visual language for a botanical skincare range rooted in traceable ingredients.",
    challenge: "Balance clinical efficacy with the tactile, living character of the formulas' plant origins.",
    direction: "Extreme close-ups, wet surfaces, and a controlled palette that lets each ingredient become its own landscape.",
    outcome: "The system launched across digital, retail, and press, doubling product-detail engagement in the first month.",
    image: "/atelier/projects/kew-botanical.jpg",
    position: { left: "46%", top: "41.5%" },
  },
  {
    id: "poppy",
    title: "Poppy Press — Spring Issue",
    label: "Poppy Press — S...",
    category: "Publishing",
    description: "A spring edition that treats color like weather.",
    overview: "Cover system, feature openers, and launch assets for Poppy Press, an independent magazine about contemporary image-making.",
    challenge: "Unify a deliberately eclectic issue without flattening the visual voice of its contributors.",
    direction: "Soft-focus fields of color create thresholds between stories while a strict typographic grid holds the issue together.",
    outcome: "The issue delivered the magazine's highest direct sales and grew its international subscriber base by 24%.",
    image: "/atelier/projects/poppy-press.jpg",
    position: { left: "62%", top: "49.5%" },
  },
  {
    id: "saffron",
    title: "Saffron — A Yellow Issue",
    label: "Saffron — A Yello...",
    category: "Creative Direction",
    description: "One color, many temperatures, and a very loud summer.",
    overview: "Guest creative direction for Saffron's annual color issue, spanning fashion, food, objects, and contemporary culture.",
    challenge: "Build an entire edition around yellow without allowing the concept to become a visual gimmick.",
    direction: "Treat yellow as atmosphere rather than accent: acidic, sun-washed, buttery, electric, and occasionally almost gone.",
    outcome: "The edition generated a record number of press pickups and became Saffron's fastest-selling issue.",
    image: "/atelier/projects/saffron-issue.jpg",
    position: { left: "77.6%", top: "43.6%" },
  },
];

const apps = [
  { id: "figma", name: "Figma", icon: "/atelier/doc-icons/figma.png" },
  { id: "claude", name: "Claude Code", icon: "/atelier/doc-icons/claude.png" },
  { id: "notes", name: "Notes", icon: "/atelier/doc-icons/notes.png" },
  { id: "photos", name: "Photos", icon: "/atelier/doc-icons/photos.png" },
  { id: "x", name: "X", icon: "/atelier/doc-icons/x.png" },
  { id: "mail", name: "Mail", icon: "/atelier/doc-icons/mail.png" },
  { id: "trash", name: "Trash", icon: "/atelier/doc-icons/trash.png" },
] as const;

type AppId = (typeof apps)[number]["id"];
type WindowState = { kind: "project"; project: Project } | { kind: "app"; app: AppId } | { kind: "folder" } | { kind: "video" };

function Clock({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  if (!now) return <span>{compact ? "14:08" : "Wed 14:08"}</span>;
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const day = now.toLocaleDateString("en-US", { weekday: "short" });
  return <span>{compact ? time : `${day} ${time}`}</span>;
}

function DesktopIcon({ project, selected, onOpen }: { project: Project; selected: boolean; onOpen: () => void }) {
  return (
    <button
      className={`desktop-icon ${selected ? "selected" : ""}`}
      style={{ left: project.position.left, top: project.position.top }}
      aria-label={project.title}
      onClick={onOpen}
    >
      <img src={project.image} alt="" draggable={false} />
      <span>{project.label}</span>
    </button>
  );
}

function WindowShell({ title, children, onClose, variant = "paper" }: { title: string; children: React.ReactNode; onClose: () => void; variant?: "paper" | "dark" }) {
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !windowRef.current) return;
    const rect = windowRef.current.getBoundingClientRect();
    dragRef.current = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !windowRef.current || window.innerWidth < 700) return;
    const nextLeft = Math.max(8, Math.min(window.innerWidth - 240, dragRef.current.left + event.clientX - dragRef.current.x));
    const nextTop = Math.max(34, Math.min(window.innerHeight - 80, dragRef.current.top + event.clientY - dragRef.current.y));
    windowRef.current.style.left = `${nextLeft}px`;
    windowRef.current.style.top = `${nextTop}px`;
    windowRef.current.style.transform = "none";
  };

  return (
    <div className={`window-shell ${variant === "dark" ? "dark-window" : ""}`} ref={windowRef} role="dialog" aria-label={title}>
      <div className="titlebar" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => (dragRef.current = null)}>
        <div className="traffic-lights">
          <button className="traffic close" aria-label="Close window" onPointerDown={(e) => e.stopPropagation()} onClick={onClose} />
          <span className="traffic minimize" />
          <span className="traffic maximize" />
        </div>
        <strong>{title}</strong>
      </div>
      <div className="window-body">{children}</div>
    </div>
  );
}

function ProjectWindow({ project, onClose }: { project: Project; onClose: () => void }) {
  const gallery = useMemo(() => {
    const start = projects.findIndex((item) => item.id === project.id);
    return [...projects.slice(start), ...projects.slice(0, start)].slice(0, 9);
  }, [project]);

  return (
    <WindowShell title={project.title} onClose={onClose}>
      <article className="project-page">
        <header className="project-hero">
          <div className="project-kicker"><b>{String(projects.findIndex((item) => item.id === project.id) + 1).padStart(2, "0")} — Project</b><span>{project.category}</span></div>
          <div><h2>{project.title}</h2><p>{project.description}</p></div>
        </header>
        <section className="project-info">
          <div className="overview"><h3>Overview</h3><p>{project.overview}</p></div>
          <div className="brief"><h3>Brief</h3><div><div><h4>Challenge</h4><p>{project.challenge}</p></div><div><h4>Direction</h4><p>{project.direction}</p></div><div><h4>Outcome</h4><p>{project.outcome}</p></div></div></div>
        </section>
        <section className="gallery">
          <h3>Gallery</h3>
          <div>{gallery.map((item) => <button key={item.id} aria-label={`${project.title} gallery image ${gallery.indexOf(item) + 1}`}><img src={item.image} alt="" /></button>)}</div>
        </section>
      </article>
    </WindowShell>
  );
}

function AppWindow({ app, onClose }: { app: AppId; onClose: () => void }) {
  if (app === "figma") {
    return (
      <WindowShell title="Figma" onClose={onClose}>
        <div className="browser-bar"><span>‹</span><span>›</span><div>figma.com/design/D2ePsCUWyaFq2ZRTYHsKzF/Modulify-Showcase</div><button>Share</button></div>
        <iframe className="figma-frame" title="Figma design" src="https://embed.figma.com/design/D2ePsCUWyaFq2ZRTYHsKzF/Modulify-Showcase?node-id=0-1&embed-host=share" allowFullScreen />
      </WindowShell>
    );
  }
  if (app === "claude") {
    return <WindowShell title="Claude Code" onClose={onClose} variant="dark"><div className="terminal"><p><span>asier@atelier</span> ~ % claude</p><p className="terminal-logo">✳</p><h2>Good afternoon, Asier</h2><p>What are we making today?</p><p className="prompt"><span>›</span> <i>Try “build a portfolio that feels like a place”</i><b /></p><small>Atelier workspace · main</small></div></WindowShell>;
  }
  if (app === "notes") {
    return <WindowShell title="Notes" onClose={onClose}><div className="notes-app"><aside><b>Notes</b><span>Today</span><p>About Asier</p><span>Yesterday</span><p>Things to make</p><p>People to call</p></aside><article><small>18 July 2026 at 14:08</small><h2>About Asier</h2><p>Independent product and brand designer working across identity, campaigns, digital experiences, and editorial systems.</p><p>I like clear ideas, good images, useful details, and work that earns a second look.</p><h3>Currently</h3><ul><li>Available for selected collaborations</li><li>Based in Zurich</li><li>Always open to a good coffee</li></ul></article></div></WindowShell>;
  }
  if (app === "photos") {
    return <WindowShell title="Photos" onClose={onClose}><div className="photos-app"><header><h2>Library</h2><span>10 Photos</span></header><div>{projects.map((project) => <img key={project.id} src={project.image} alt={project.title} />)}</div></div></WindowShell>;
  }
  if (app === "x") {
    return <WindowShell title="X" onClose={onClose}><div className="social-app"><div className="avatar">AB</div><div><h2>Asier <small>@asiermakes</small></h2><p>Independent designer. Images, identities, interfaces—and occasionally a desktop that looks suspiciously like 2007.</p><div className="social-card"><img src="/atelier/projects/bloom-sneaker.jpg" alt="Bloom sneaker campaign" /><p>New work: Bloom, where trail running meets full bloom.</p></div><small>9:42 AM · Jul 18, 2026</small></div></div></WindowShell>;
  }
  if (app === "mail") {
    return <WindowShell title="New Message" onClose={onClose}><form className="mail-app" action="mailto:hello@asier.studio"><label>To: <span>Asier &lt;hello@asier.studio&gt;</span></label><label>Subject: <input aria-label="Subject" placeholder="Project enquiry" /></label><textarea aria-label="Message" placeholder="Hello Asier," /><button type="submit">Send</button></form></WindowShell>;
  }
  return <WindowShell title="Trash" onClose={onClose}><div className="empty-trash"><img src="/atelier/doc-icons/trash.png" alt="" /><h2>Trash is Empty</h2><p>Nothing to see here. A rare and beautiful state.</p></div></WindowShell>;
}

function FolderWindow({ onClose, onOpenVideo }: { onClose: () => void; onOpenVideo: () => void }) {
  const sidebar = [
    { title: "iCloud", items: [{ label: "Recents", icon: "recents" }, { label: "Shared", icon: "shared" }] },
    { title: "Favorites", items: [
      { label: "Desktop", icon: "desktop" },
      { label: "Applications", icon: "applications" },
      { label: "Projects", icon: "projects" },
      { label: "MotionIn.Design", icon: "motion" },
      { label: "Work", icon: "work" },
      { label: "Movies", icon: "movies" },
      { label: "Downloads", icon: "downloads" },
      { label: "Documents", icon: "documents" },
    ] },
  ];

  return <WindowShell title="Don't Open" onClose={onClose}>
    <div className="finder-app">
      <div className="finder-toolbar">
        <div className="finder-arrows"><button aria-label="Back"><span /></button><button aria-label="Forward" disabled><span /></button></div>
        <b><span className="tiny-folder" />Don&apos;t Open</b>
        <div className="finder-tools">
          <div className="view-switcher">
            <button className="active" aria-label="Icon view"><span className="view-grid"><i /><i /><i /><i /></span></button>
            <button aria-label="List view"><span className="view-list"><i /><i /><i /></span></button>
            <button aria-label="Column view"><span className="view-columns"><i /><i /><i /></span></button>
            <button aria-label="Gallery view"><span className="view-gallery"><i /></span></button>
          </div>
          <span className="finder-search" />
        </div>
      </div>
      <div className="finder-content">
        <aside>{sidebar.map((group) => <div key={group.title}><h3>{group.title}</h3>{group.items.map((item) => <p key={item.label}><i className={`sidebar-icon ${item.icon}`}><span /></i>{item.label}</p>)}</div>)}</aside>
        <div className="finder-files">
          <button className="movie-file" aria-label="Open Dont play this video.mov" onDoubleClick={onOpenVideo} onClick={onOpenVideo}>
            <span className="mov-icon"><i className="camera-body" /><b className="camera-lens" /><small>MOV</small></span>
            <strong>Dont play this<br />video.mov</strong>
          </button>
        </div>
      </div>
      <div className="finder-status"><div><span className="tiny-folder" />Macintosh HD <b>›</b> Users <b>›</b> asier <b>›</b> Desktop <b>›</b> <strong>Don&apos;t Open</strong></div><span>1 item</span></div>
    </div>
  </WindowShell>;
}

function VideoWindow({ onClose }: { onClose: () => void }) {
  return <WindowShell title="Dont play this video.mov" onClose={onClose} variant="dark">
    <div className="video-app">
      <iframe
        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1"
        title="Rick Astley — Never Gonna Give You Up"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  </WindowShell>;
}

export default function Home() {
  const [activeWindow, setActiveWindow] = useState<WindowState | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [dockHover, setDockHover] = useState<number | null>(null);

  const openProject = (project: Project) => {
    setSelected(project.id);
    setActiveWindow({ kind: "project", project });
  };
  const openApp = (app: AppId) => {
    setSelected(app);
    setActiveWindow({ kind: "app", app });
    setShowMore(false);
  };
  const closeWindow = () => {
    setActiveWindow(null);
    setSelected(null);
  };

  return (
    <main className="desktop" aria-label="Asier — interactive desktop portfolio" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
      <h1 className="sr-only">Asier — Independent Product and Brand Designer</h1>

      <div className="menu-bar desktop-only">
        <div><span className="menu-mark" /><b>Atelier</b><span>File</span><span>Edit</span><span>View</span><span>Window</span><span>Help</span></div>
        <div><span className="battery"><i /></span><span>100%</span><Clock /></div>
      </div>
      <div className="mobile-clock"><Clock compact /></div>

      <div className="desktop-files desktop-only">
        {projects.map((project) => <DesktopIcon key={project.id} project={project} selected={selected === project.id} onOpen={() => openProject(project)} />)}
        <button className={`desktop-icon folder ${selected === "folder" ? "selected" : ""}`} aria-label="Don't Open" onClick={() => { setSelected("folder"); setActiveWindow({ kind: "folder" }); }}>
          <img src="/atelier/doc-icons/folder.png" alt="" draggable={false} /><span>Don&apos;t Open</span>
        </button>
      </div>

      <div className="dock desktop-dock desktop-only" aria-label="Applications" onMouseLeave={() => setDockHover(null)}>
        {apps.map((app, index) => {
          const distance = dockHover === null ? Infinity : Math.abs(dockHover - index);
          const size = distance === 0 ? 96 : distance === 1 ? 68.375 : 56;
          return <div className={`dock-slot ${index === 4 || index === 6 ? "separated" : ""}`} key={app.id}>
            <span>{app.name}</span>
            <button style={{ width: size, height: size }} aria-label={app.name} onMouseEnter={() => setDockHover(index)} onFocus={() => setDockHover(index)} onBlur={() => setDockHover(null)} onClick={() => openApp(app.id)}><img src={app.icon} alt="" /></button>
          </div>;
        })}
      </div>

      <div className="dock mobile-dock" aria-label="Applications">
        {["figma", "notes", "mail"].map((id) => { const app = apps.find((item) => item.id === id)!; return <div className="dock-slot" key={app.id}><button aria-label={app.name} onClick={() => openApp(app.id)}><img src={app.icon} alt="" /></button></div>; })}
        <div className="dock-slot"><button aria-label="More apps" className="more-button" onClick={() => setShowMore((value) => !value)}><i /><i /><i /><i /></button></div>
      </div>

      {showMore && <div className="more-apps"><b>Applications</b>{apps.filter((app) => !["figma", "notes", "mail"].includes(app.id)).map((app) => <button key={app.id} onClick={() => openApp(app.id)}><img src={app.icon} alt="" /><span>{app.name}</span></button>)}</div>}

      {activeWindow?.kind === "project" && <ProjectWindow project={activeWindow.project} onClose={closeWindow} />}
      {activeWindow?.kind === "app" && <AppWindow app={activeWindow.app} onClose={closeWindow} />}
      {activeWindow?.kind === "folder" && <FolderWindow onClose={closeWindow} onOpenVideo={() => setActiveWindow({ kind: "video" })} />}
      {activeWindow?.kind === "video" && <VideoWindow onClose={closeWindow} />}

      <div className="portfolio-stamp desktop-only"><span>↘</span><div><small>Independent designer</small><b>Asier</b></div></div>
    </main>
  );
}
