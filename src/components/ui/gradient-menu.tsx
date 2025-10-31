import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Gift, Dumbbell, Video } from 'lucide-react';

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { 
    title: 'Challenges', 
    icon: <Trophy />, 
    gradientFrom: '#a955ff', 
    gradientTo: '#ea51ff',
    path: '/challenges'
  },
  { 
    title: 'Events', 
    icon: <Calendar />, 
    gradientFrom: '#56CCF2', 
    gradientTo: '#2F80ED',
    path: '/events'
  },
  { 
    title: 'Rewards', 
    icon: <Gift />, 
    gradientFrom: '#FF9966', 
    gradientTo: '#FF5E62',
    path: '/rewards'
  },
  { 
    title: 'Reels', 
    icon: <Video />, 
    gradientFrom: '#ffa9c6', 
    gradientTo: '#f434e2',
    path: '/reels'
  },
  { 
    title: 'Find Gyms', 
    icon: <Dumbbell />, 
    gradientFrom: '#80FF72', 
    gradientTo: '#7EE8FA',
    path: '/gyms'
  }
];

export default function GradientMenu() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center py-8">
      <ul className="flex flex-wrap gap-6 justify-center">
        {menuItems.map(({ title, icon, gradientFrom, gradientTo, path }, idx) => (
          <li
            key={idx}
            onClick={() => navigate(path)}
            style={{ 
              '--gradient-from': gradientFrom, 
              '--gradient-to': gradientTo 
            } as React.CSSProperties}
            className="relative w-[60px] h-[60px] bg-card/80 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center transition-all duration-500 hover:w-[180px] hover:shadow-none group cursor-pointer"
          >
            {/* Gradient background on hover */}
            <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100"></span>
            {/* Blur glow */}
            <span className="absolute top-[10px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[15px] opacity-0 -z-10 transition-all duration-500 group-hover:opacity-50"></span>

            {/* Icon */}
            <span className="relative z-10 transition-all duration-500 group-hover:scale-0 delay-0">
              <span className="text-2xl text-foreground opacity-70">{icon}</span>
            </span>

            {/* Title */}
            <span className="absolute text-white uppercase tracking-wide text-sm transition-all duration-500 scale-0 group-hover:scale-100 delay-150 font-medium">
              {title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
