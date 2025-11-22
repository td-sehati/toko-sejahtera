
import React from 'react';

type IconName = 'dashboard' | 'pos' | 'products' | 'debt' | 'reports' | 'expenses' | 'crm' | 'plus' | 'edit' | 'trash' | 'check' | 'x' | 'search' | 'users' | 'truck' | 'dollar' | 'trending-up' | 'arrow-down' | 'arrow-up' | 'tag' | 'download' | 'upload' | 'file-text' | 'book' | 'menu' | 'chevron-left' | 'chevron-right' | 'logout';

interface IconProps {
  name: IconName;
  className?: string;
}

// FIX: Changed JSX.Element to React.ReactNode to avoid "Cannot find namespace 'JSX'" error.
const ICONS: Record<IconName, React.ReactNode> = {
  dashboard: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  pos: <path d="M16 4h-2a2 2 0 1 0-4 0H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM12 2a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zM9 12a1 1 0 0 1 1-1h4a1 1 0 0 1 0 2h-4a1 1 0 0 1-1-1zm1 4a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2z" />,
  products: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />,
  debt: <><path d="M15 8.5a2.5 2.5 0 1 0-5 0M12 11.5c-2 0-3.5 1-4.5 2.5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM12 20c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" /></>,
  reports: <path d="M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 15.2" />,
  expenses: <><path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" /><path d="M20 12h-2.1c-.1-1.3-.5-2.5-1.2-3.6l1.5-1.5c.4-.4.4-1 0-1.4l-1.4-1.4c-.4-.4-1-.4-1.4 0l-1.5 1.5c-1.1-.7-2.3-1.1-3.6-1.2V2c0-.6-.4-1-1-1s-1 .4-1 1v2.1c-1.3.1-2.5.5-3.6 1.2L5.4 3.7c-.4-.4-1-.4-1.4 0L2.6 5.1c-.4.4-.4 1 0 1.4l1.5 1.5c-.7 1.1-1.1 2.3-1.2 3.6H2c-.6 0-1 .4-1 1s.4 1 1 1h2.1c.1 1.3.5 2.5 1.2 3.6l-1.5 1.5c-.4.4-.4 1 0 1.4l1.4 1.4c.4.4 1 .4 1.4 0l1.5-1.5c1.1.7 2.3 1.1 3.6 1.2V22c0 .6.4 1 1 1s1-.4 1-1v-2.1c1.3-.1 2.5-.5 3.6-1.2l1.5 1.5c.4.4 1 .4 1.4 0l1.4-1.4c.4-.4.4-1 0-1.4l-1.5-1.5c.7-1.1 1.1-2.3 1.2-3.6H22c.6 0 1-.4 1-1s-.4-1-1-1z" /></>,
  crm: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></>,
  plus: <path d="M12 5v14m-7-7h14" />,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
  trash: <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
  check: <path d="M20 6 9 17l-5-5" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v2" /><circle cx="8" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  truck: <><path d="M10 17.5V14H3V4h14v10h-4v3.5" /><circle cx="6" cy="17.5" r="2.5" /><circle cx="18" cy="17.5" r="2.5" /><path d="M14 8h1" /></>,
  dollar: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  'trending-up': <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>,
  'arrow-down': <path d="M12 5v14m-4-4 4 4 4-4" />,
  'arrow-up': <path d="M12 19V5m-4 4 4-4 4 4" />,
  tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
  'file-text': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  menu: <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>,
  'chevron-left': <polyline points="15 18 9 12 15 6" />,
  'chevron-right': <polyline points="9 18 15 12 9 6" />,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
};

export default Icon;
