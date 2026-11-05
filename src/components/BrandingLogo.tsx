import React, { useState } from 'react';
import {
  Cpu,
  Server,
  Shield,
  Zap,
  Layers,
  Activity,
  Terminal,
  Boxes,
  HardDrive,
  Brain,
  Network,
  Radio,
  Gauge,
  Flame,
  Database,
  Sparkles,
  Workflow,
  Compass,
  Radar,
  CloudLightning,
  Anchor,
  Infinity as InfinityIcon,
  Fingerprint,
  LucideIcon
} from 'lucide-react';
import { BrandingConfig } from '../types';

export const ICON_MAP: Record<string, { label: string; icon: LucideIcon; category: string }> = {
  Cpu: { label: 'Processor (CPU)', icon: Cpu, category: 'Hardware' },
  Server: { label: 'Server Blade', icon: Server, category: 'Hardware' },
  HardDrive: { label: 'Storage / SSD', icon: HardDrive, category: 'Hardware' },
  Database: { label: 'Database', icon: Database, category: 'Infrastructure' },
  Boxes: { label: 'Containers / Pods', icon: Boxes, category: 'Infrastructure' },
  Layers: { label: 'Tech Stack', icon: Layers, category: 'Infrastructure' },
  Network: { label: 'Mesh Topology', icon: Network, category: 'Network' },
  Radar: { label: 'Telemetry Radar', icon: Radar, category: 'Network' },
  Radio: { label: 'Signal Broadcast', icon: Radio, category: 'Network' },
  Shield: { label: 'Security Shield', icon: Shield, category: 'Security' },
  Fingerprint: { label: 'Identity / Auth', icon: Fingerprint, category: 'Security' },
  Zap: { label: 'High Performance', icon: Zap, category: 'Performance' },
  Gauge: { label: 'Resource Gauge', icon: Gauge, category: 'Performance' },
  Activity: { label: 'Health Pulse', icon: Activity, category: 'Diagnostics' },
  Flame: { label: 'Load / Stress', icon: Flame, category: 'Diagnostics' },
  Brain: { label: 'AI Intelligence', icon: Brain, category: 'AI & Ops' },
  Sparkles: { label: 'Advisor AI', icon: Sparkles, category: 'AI & Ops' },
  Terminal: { label: 'CLI & Ops', icon: Terminal, category: 'DevOps' },
  Workflow: { label: 'Orchestrator', icon: Workflow, category: 'DevOps' },
  Compass: { label: 'Navigator', icon: Compass, category: 'DevOps' },
  CloudLightning: { label: 'Cloud Burst', icon: CloudLightning, category: 'Cloud' },
  Infinity: { label: 'DevOps Loop', icon: InfinityIcon, category: 'DevOps' },
  Anchor: { label: 'Cluster Anchor', icon: Anchor, category: 'Infrastructure' }
};

export const GRADIENT_PRESETS = [
  { id: 'intel-blue', name: 'Intel Indigo', classes: 'from-blue-600 to-indigo-500', shadow: 'shadow-indigo-500/25', glowHex: '#6366f1' },
  { id: 'emerald-teal', name: 'Cyber Emerald', classes: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25', glowHex: '#10b981' },
  { id: 'neon-violet', name: 'Ultra Violet', classes: 'from-purple-600 to-violet-500', shadow: 'shadow-purple-500/25', glowHex: '#a855f7' },
  { id: 'amber-orange', name: 'Solar Amber', classes: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25', glowHex: '#f59e0b' },
  { id: 'crimson-rose', name: 'Crimson Matrix', classes: 'from-rose-600 to-pink-500', shadow: 'shadow-rose-500/25', glowHex: '#f43f5e' },
  { id: 'cyan-sky', name: 'Hyper Cyan', classes: 'from-cyan-400 to-blue-600', shadow: 'shadow-cyan-500/25', glowHex: '#06b6d4' },
  { id: 'stealth-dark', name: 'Stealth Onyx', classes: 'from-slate-700 via-slate-800 to-slate-900', shadow: 'shadow-slate-700/30', glowHex: '#64748b' },
  { id: 'blaze-fire', name: 'Vulcan Blaze', classes: 'from-red-600 to-amber-500', shadow: 'shadow-red-500/25', glowHex: '#ef4444' }
];

export const BORDER_RADIUS_OPTIONS = [
  { id: 'rounded-xl', label: 'Squircle (Standar)', class: 'rounded-xl' },
  { id: 'rounded-2xl', label: 'Squircle Halus', class: 'rounded-2xl' },
  { id: 'rounded-3xl', label: 'Squircle Lebar', class: 'rounded-3xl' },
  { id: 'rounded-full', label: 'Bulat (Circle)', class: 'rounded-full' },
  { id: 'rounded-lg', label: 'Kotak Melengkung', class: 'rounded-lg' }
];

interface BrandingLogoProps {
  branding: BrandingConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showHoverIndicator?: boolean;
}

export const BrandingLogo: React.FC<BrandingLogoProps> = ({
  branding,
  size = 'md',
  className = '',
  showHoverIndicator = false
}) => {
  const [imageError, setImageError] = useState(false);

  // Size styling mappings
  const containerSizes = {
    sm: 'w-9 h-9 p-2',
    md: 'w-11 h-11 p-2.5',
    lg: 'w-14 h-14 p-3',
    xl: 'w-20 h-20 p-4'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-11 h-11'
  };

  // Animation mapping
  let animationClass = '';
  let filterGlow = '';
  if (branding.iconAnimation === 'pulse') {
    animationClass = 'animate-pulse';
  } else if (branding.iconAnimation === 'glow') {
    filterGlow = 'drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]';
  } else if (branding.iconAnimation === 'bounce') {
    animationClass = 'animate-bounce';
  }

  // Find preset gradient or default
  const gradientClass = branding.gradient || 'from-blue-600 to-indigo-500';
  const radiusClass = branding.borderRadius || 'rounded-xl';

  // Resolved Lucide icon
  const IconDef = ICON_MAP[branding.iconName]?.icon || Cpu;

  const hasCustomImage = branding.logoType === 'image' && branding.customImageUrl && !imageError;

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center bg-gradient-to-tr ${gradientClass} ${radiusClass} text-white shadow-lg shadow-indigo-500/20 overflow-hidden transition-all duration-200 ${containerSizes[size]} ${className}`}
    >
      {hasCustomImage ? (
        <img
          src={branding.customImageUrl}
          alt={branding.title || 'Brand Logo'}
          className={`w-full h-full ${branding.imageFit === 'contain' ? 'object-contain' : 'object-cover'} ${animationClass} ${filterGlow} rounded-[inherit]`}
          onError={() => setImageError(true)}
        />
      ) : (
        <IconDef className={`${iconSizes[size]} ${animationClass} ${filterGlow}`} />
      )}

      {/* Subtle glass gloss highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-[inherit]" />
    </div>
  );
};
