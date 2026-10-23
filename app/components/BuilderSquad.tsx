import Image from "next/image";

export default function BuilderSquad() {
  const members = [
    {
      name: "Alex Rivera",
      role: "Full-Stack / Team Lead",
      roleColor: "text-primary",
      bio: "TypeScript, Rust, Next.js. Architect of 4 winning hackathon microservices.",
      handle: "@alexrivera_dev • 8 hacks",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD2mGT6A6T9cGyDOrN6JK8yJRFzJEqeZRnIkMLq369TDU9h7R5Y1YV6NcDqXWysNOeL230GxUE9zFW3nIeIiiortN3RMxUwGNtw-e-mE1gcjRxPbLmIiTcwNzp2PURlXMx09NFumoJr5vciENySY506bkpdqegltwoNU8761qzNIJESA54me3F5XzXQ-sAT-U8CI_62MPpRhfgbZ364e4arpb2y2_zKt09_xLAfRYNlLKFc_lYhs56P",
    },
    {
      name: "Maya Chen",
      role: "AI / Prompt Engineer",
      roleColor: "text-secondary",
      bio: "PyTorch, LangChain, RAG agent pipelines. Specializes in 24hr latency breakthroughs.",
      handle: "@chen_ai • 6 hacks",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC1PKJoTEziZ2Pcd0pr7tf2orKtXOVkJj9TsoYUFaNe7AvC69OzvVDBqSHhZpS4o79OzfSLuKm2Yh6UDsiXjHLhiDy7vDGYc48mOkEYNMRWx2IaNf3Mf-8ZDFlBlES1uNDfqgN4zFHxbHeujWQux7SAI6MRxH2EMIhpMZ_a-TOKDdqdZ2O7v0htgzfhv-IPEl6B1M4D9HehORn-z_Y25sd1xXVhPuE0byJRfCAgdA7YqbeG1TorW-gK",
    },
    {
      name: "Liam Vance",
      role: "Systems / Web3",
      roleColor: "text-tertiary",
      bio: "Solidity, Go, decentralized storage. Handles the hard infrastructure layer.",
      handle: "@liam_vance • 5 hacks",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB2Lg2t-uYBLe7f8l7DoMAggzK_sJRLBR37zn5i6q3uqL5Isf3nYVgrDComdc9Fbbd-dNeBrV23jh5GVvhseQtqs3s_Zhq1OUMvAsGm_LOUJdn5Z1hKOgxNFcG5_6AeGhXvlL1GPUb-JrGxpV7uaJZIJxljoqqkw1YuD3lBF9h_l9CsnX9G8TubONAdHHmFIx4ZH7fCiwnrFx29OUpuCFlfI8cLAabehWxtbKJCsrSrEsktKF3kXzNM",
    },
    {
      name: "Sofia Patel",
      role: "Product & UI/UX",
      roleColor: "text-primary-fixed",
      bio: "Rapid prototyping, design systems, narrative pitch deck choreography.",
      handle: "@sofiapatel_ux • 9 hacks",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDt4ri51afXGWslPS2lOfqqFyLWNOKvGQoW1F-GL2QSHSnkr_ITShncfd-WuLQvrH_9XFQ46eMMEpdfkwKZegHgoMUYkMmCnQIqyj7QAu112vOCGbMLeh2LBTBdC_zioX2Qj5_qZG1xEkgQM0eUIrQC6p-fy-TIoftGisDer9Vjd61RpX7iL8adkvdaPaHd-VrIZ-m_VsQ_oo_PeQ1xb6n8v1VcdvEpgVimQeG3qF7SuvKh1f8N476y",
    },
  ];

  return (
    <section id="hall-of-builders" className="w-full bg-[#0c0e13] px-4 sm:px-6 lg:px-8 py-20 border-y border-outline-variant/30">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        {/* Section Intro & Bio */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 text-secondary font-mono text-xs uppercase tracking-widest font-semibold">
              <span className="material-symbols-outlined text-[16px]">stars</span>
              <span>HALL OF BUILDERS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-on-surface">
              Featured Builder Squad: NovaLogic
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
              Building multimodal AI agents &amp; decentralized compute infrastructure. 3x Hackathon Champions, alumni of ETHGlobal and MIT Grand Hack.
            </p>
          </div>

          {/* Social Badges & Links */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-surface-container-high text-on-surface font-mono text-xs hover:bg-surface-bright flex items-center gap-2 transition-colors border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>github.com/novalogic</span>
            </a>
            <a
              href="#"
              className="px-3.5 py-2 rounded-xl bg-surface-container-high text-on-surface font-mono text-xs hover:bg-surface-bright flex items-center gap-2 transition-colors border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span>@NovaLogicSquad</span>
            </a>
          </div>
        </div>

        {/* Member Grid (4 Builders) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {members.map((member, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-3.5 hover:bg-surface-container hover:border-outline-variant/50 transition-all duration-200 group"
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden ring-1 ring-outline-variant/40 group-hover:ring-primary/50 transition-all">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                  {member.name}
                </h4>
                <span className={`font-mono text-xs font-semibold ${member.roleColor}`}>
                  {member.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {member.bio}
              </p>
              <div className="font-mono text-[11px] text-outline pt-1 mt-auto border-t border-outline-variant/20">
                {member.handle}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Hackathon Trophy Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-outline-variant/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0 border border-secondary/30">
              <span className="material-symbols-outlined text-3xl">military_tech</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded bg-secondary/20 text-secondary font-mono text-xs font-bold">
                  1ST PLACE WINNER
                </span>
                <span className="font-mono text-xs text-outline">
                  Global Open Source Hack 2024
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-on-surface mb-1">
                Project HyperAgent: Autonomous Edge Mesh
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                An open-source peer-to-peer AI agent coordinator operating completely client-side in the browser via WebAssembly and WebGPU.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-mono text-xs hover:bg-surface-bright flex items-center gap-1.5 transition-colors border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[16px]">code</span>
              <span>novalogic/hyper-agent</span>
            </a>
            <a
              href="#demo"
              className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold hover:bg-primary hover:text-on-primary flex items-center gap-1.5 transition-all shadow-[0_0_16px_rgba(160,120,255,0.4)]"
            >
              <span>Live Demo</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
