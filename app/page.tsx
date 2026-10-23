import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import Features from "./components/Features";
import BuilderSquad from "./components/BuilderSquad";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Floating Glass Navigation */}
      <Navbar />

      {/* Main Page Flow */}
      <main className="w-full pt-16 flex-1 flex flex-col">
        {/* Hero Section with Live Developer Canvas */}
        <Hero />

        {/* Global Developer Metrics & Telemetry Bar */}
        <StatsBar />

        {/* Core Architectural Features Showcase */}
        <Features />

        {/* Hall of Builders: Featured Squad NovaLogic */}
        <BuilderSquad />

        {/* High Conversion Team Creation Call-to-Action */}
        <CtaSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
