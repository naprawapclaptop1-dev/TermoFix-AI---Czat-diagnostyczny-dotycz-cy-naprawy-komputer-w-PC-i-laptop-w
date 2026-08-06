const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/import \{\s+Cpu,\s+ShieldCheck,\s+Tv,\s+Gauge,\s+Archive,\s+Terminal,\s+HardDrive,\s+Monitor,\s+Notebook,\s+Activity,\s+Zap,\s+PenTool,\s+Download,\s+Wifi,\s+Power,\s+Headset,\s+Menu,\s+X,\s+MessageSquare,\s+ShieldAlert,\s+Image as ImageIcon,\s+ChevronRight,\s+ArrowUpCircle,\s+Send,\s+Settings,\s+Database,\s+FileText,\s+User,\s+CheckCircle2,\s+RefreshCw,\s+Flame,\s+UploadCloud,\s+DownloadCloud,\s+Search,\s+Smartphone,\s+Video,\s+Music,\s+Radio,\s+Camera,\s+Server,\s+Usb,\s+Tool,\s+FolderSearch,\s+Code,\s+Disc\s+\} from 'lucide-react';/, "import { Cpu, ShieldCheck, Tv, Gauge, Archive, Terminal, HardDrive, Monitor, Notebook, Activity, Zap, PenTool, Download, Wifi, Power, Headset, Menu, X, MessageSquare, ShieldAlert, Image as ImageIcon, ChevronRight, ArrowUpCircle, Send, Settings, Database, FileText, User, CheckCircle2, RefreshCw, Flame, UploadCloud, DownloadCloud, Search, Smartphone, Video, Music, Radio, Camera, Server, Usb, Tool, FolderSearch, Code, Disc, Layers } from 'lucide-react';");

fs.writeFileSync(file, code);
