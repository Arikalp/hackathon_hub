export default function StatsBar() {
  const stats = [
    {
      label: "Indexed",
      value: "1,420+",
      subtext: "Hackathons Tracked",
      icon: "data_object",
      iconColor: "text-primary",
      valueColor: "text-on-surface",
    },
    {
      label: "Assembled",
      value: "8,850+",
      subtext: "Teams Built",
      icon: "groups",
      iconColor: "text-secondary",
      valueColor: "text-secondary",
    },
    {
      label: "Shipped",
      value: "14,200+",
      subtext: "Projects Shipped",
      icon: "rocket_launch",
      iconColor: "text-tertiary",
      valueColor: "text-on-surface",
    },
    {
      label: "Rewards",
      value: "$18.4M",
      subtext: "Wins & Grants Celebrated",
      icon: "trophy",
      iconColor: "text-primary-container",
      valueColor: "text-primary",
    },
  ];

  return (
    <section className="w-full bg-[#0c0e13] px-4 sm:px-6 lg:px-8 py-10 border-y border-outline-variant/30">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2 transition-all duration-200 hover:bg-surface-container hover:border-outline-variant/40 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between text-outline">
                <span className="font-mono text-xs uppercase tracking-wider">
                  {stat.label}
                </span>
                <span className={`material-symbols-outlined text-[18px] ${stat.iconColor}`}>
                  {stat.icon}
                </span>
              </div>
              <div
                className={`text-2xl sm:text-3xl md:text-4xl font-bold font-mono ${stat.valueColor}`}
              >
                {stat.value}
              </div>
              <span className="text-xs sm:text-sm text-on-surface-variant">
                {stat.subtext}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-outline pt-1">
          <span className="font-mono text-[11px] italic text-outline/80">
            * Illustrative platform preview metrics
          </span>
          <span className="font-mono text-[11px] text-outline/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            Real-time telemetry stream synchronized via WebSockets
          </span>
        </div>
      </div>
    </section>
  );
}
