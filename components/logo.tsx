"use client"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: "text-xl", subtext: "text-[8px]" },
    md: { icon: 48, text: "text-2xl", subtext: "text-[10px]" },
    lg: { icon: 64, text: "text-4xl", subtext: "text-xs" },
    xl: { icon: 96, text: "text-6xl", subtext: "text-sm" }
  }
  
  const { icon, text, subtext } = sizes[size]
  
  return (
    <div className="flex items-center gap-3">
      {/* Logo Icon - Stylized "L" with gradient and queue lines */}
      <div 
        className="relative flex items-center justify-center rounded-2xl gradient-brand"
        style={{ width: icon, height: icon }}
      >
        {/* The "L" letter */}
        <span 
          className="font-sans font-extrabold text-white leading-none"
          style={{ fontSize: icon * 0.55 }}
        >
          L
        </span>
        {/* Queue lines effect - representing a lineup */}
        <div 
          className="absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col gap-[2px]"
          style={{ width: icon * 0.15 }}
        >
          <div className="h-[2px] bg-white/80 rounded-full" />
          <div className="h-[2px] bg-white/60 rounded-full" style={{ width: '80%' }} />
          <div className="h-[2px] bg-white/40 rounded-full" style={{ width: '60%' }} />
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-sans font-extrabold uppercase tracking-tight text-white ${text}`}>
            THE LINEUP
          </span>
        </div>
      )}
    </div>
  )
}

export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <div 
      className="relative flex items-center justify-center rounded-2xl gradient-brand"
      style={{ width: size, height: size }}
    >
      <span 
        className="font-sans font-extrabold text-white leading-none"
        style={{ fontSize: size * 0.55 }}
      >
        L
      </span>
      <div 
        className="absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col gap-[2px]"
        style={{ width: size * 0.15 }}
      >
        <div className="h-[2px] bg-white/80 rounded-full" />
        <div className="h-[2px] bg-white/60 rounded-full" style={{ width: '80%' }} />
        <div className="h-[2px] bg-white/40 rounded-full" style={{ width: '60%' }} />
      </div>
    </div>
  )
}
