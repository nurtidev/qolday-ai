// Lucide-style line icons. 24x24 default, currentColor.
const Icon = ({ children, size = 20, strokeWidth = 1.75, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const I = {
  Search:    (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>,
  ChevronDown: (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>,
  ChevronUp:   (p) => <Icon {...p}><path d="m6 15 6-6 6 6"/></Icon>,
  ChevronRight:(p) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>,
  ChevronLeft: (p) => <Icon {...p}><path d="m15 6-6 6 6 6"/></Icon>,
  Globe:     (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></Icon>,
  User:      (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon>,
  Bell:      (p) => <Icon {...p}><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z"/><path d="M10 21a2 2 0 0 0 4 0"/></Icon>,
  Bookmark:  (p) => <Icon {...p}><path d="M6 3h12v18l-6-4-6 4Z"/></Icon>,
  Coins:     (p) => <Icon {...p}><circle cx="9" cy="9" r="6"/><path d="M14.5 5.5a6 6 0 1 1-3 11"/><path d="M9 6v6l3 1"/></Icon>,
  Shield:    (p) => <Icon {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/></Icon>,
  Plane:     (p) => <Icon {...p}><path d="M2.5 12 21 5l-3 8 3 8-7-3-3.5 4-1-6Z"/></Icon>,
  Building:  (p) => <Icon {...p}><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01"/></Icon>,
  Sprout:    (p) => <Icon {...p}><path d="M7 20c0-7 5-9 5-9s5 2 5 9"/><path d="M12 11V4"/><path d="M12 11s-3-1-3-4 3-3 3-3 3 0 3 3-3 4-3 4Z"/></Icon>,
  Briefcase: (p) => <Icon {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></Icon>,
  Document:  (p) => <Icon {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></Icon>,
  Upload:    (p) => <Icon {...p}><path d="M12 4v12"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></Icon>,
  Download:  (p) => <Icon {...p}><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></Icon>,
  Check:     (p) => <Icon {...p}><path d="m5 12 5 5 9-11"/></Icon>,
  CheckCircle:(p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></Icon>,
  X:         (p) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18"/></Icon>,
  Plus:      (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  Filter:    (p) => <Icon {...p}><path d="M3 5h18l-7 9v6l-4-2v-4Z"/></Icon>,
  Phone:     (p) => <Icon {...p}><path d="M5 4h3l2 5-2 1a11 11 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></Icon>,
  Mail:      (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Icon>,
  MapPin:    (p) => <Icon {...p}><path d="M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></Icon>,
  Calendar:  (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></Icon>,
  Clock:     (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  ArrowRight:(p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Icon>,
  ArrowLeft: (p) => <Icon {...p}><path d="M19 12H5M11 5l-7 7 7 7"/></Icon>,
  ExternalLink:(p) => <Icon {...p}><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></Icon>,
  Info:      (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></Icon>,
  Alert:     (p) => <Icon {...p}><path d="M12 3 2 20h20Z"/><path d="M12 10v4M12 17h.01"/></Icon>,
  Hash:      (p) => <Icon {...p}><path d="M5 9h14M5 15h14M10 3 8 21M16 3l-2 18"/></Icon>,
  Tag:       (p) => <Icon {...p}><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z"/><circle cx="8" cy="8" r="1.5"/></Icon>,
  Sliders:   (p) => <Icon {...p}><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h14M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></Icon>,
  Grid:      (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>,
  List:      (p) => <Icon {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></Icon>,
  Trash:     (p) => <Icon {...p}><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14"/></Icon>,
  Eye:       (p) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></Icon>,
  Lock:      (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></Icon>,
  Sparkle:   (p) => <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.5 2.5M16 16l2.5 2.5M5.5 18.5 8 16M16 8l2.5-2.5"/></Icon>,
  Star:      (p) => <Icon {...p}><path d="m12 3 2.7 6 6.3.6-4.8 4.4 1.5 6.2L12 17l-5.7 3.2L7.8 14 3 9.6 9.3 9Z"/></Icon>,
};

window.I = I;
window.Icon = Icon;
