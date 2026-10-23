import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0c0e13] border-t border-outline-variant/30 py-12">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-outline-variant/20">
          {/* Logo & Vision Statement */}
          <div className="col-span-2 flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded overflow-hidden bg-primary/10 flex items-center justify-center p-0.5">
                <Image
                  src="https://lh3.googleusercontent.com/aida/AEtjO1XgcjrcHVRsDjhC1Rjzsa0s-pjxLr4jaNpETpIKiTrasziLVPghl-IkckR6BCMhFsIfmehPId3cdAieb6XL0O6658csKDnCg30orvSVFNIVeim6jQS9p5Tc34YOsFZ9dg-yFYbD-WdGLRfMInvlWyk4Lc6xS98-obFvMFvAD-2WQR0xnrv88jH5W30USblOgiZMx3fVQ3y8uHqcy_8xNFzXT0SL81NWDEDleffgUj9GyXo01_cNgIwjz1s"
                  alt="Hackathon Hub Logo"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-semibold text-lg text-on-surface">
                Hackathon Hub
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm leading-relaxed">
              The premier execution engine for competitive hackathon teams, rapid prototyping, and high-velocity shipping.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(168,213,76,0.6)] animate-pulse"></span>
              <span className="font-mono text-xs text-on-surface-variant">
                All systems operational
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-outline mb-1 font-semibold">
              Product
            </span>
            <a
              href="#discover"
              className="text-xs sm:text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Hackathons
            </a>
            <a
              href="#teams"
              className="text-xs sm:text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Squad Finder
            </a>
            <a
              href="#features"
              className="text-xs sm:text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Live Terminal
            </a>
          </div>

          {/* Resources Links */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-outline mb-1 font-semibold">
              Resources
            </span>
            <a
              href="https://github.com/Arikalp/hackathon_hub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Documentation
            </a>
            <a
              href="https://github.com/Arikalp/hackathon_hub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              GitHub
            </a>
            <a
              href="#api"
              className="text-xs sm:text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              API Reference
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-outline mb-1 font-semibold">
              Legal
            </span>
            <a
              href="#privacy"
              className="text-xs sm:text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="text-xs sm:text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#security"
              className="text-xs sm:text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Security
            </a>
          </div>
        </div>

        {/* Bottom Meta */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-on-surface-variant font-mono text-xs">
          <span>© 2025 Hackathon Hub Inc. Engineered for competitive builders.</span>
          <span className="text-outline">v2.4.0-prod</span>
        </div>
      </div>
    </footer>
  );
}
