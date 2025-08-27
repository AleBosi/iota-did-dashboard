import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Gauge,
  BarChart3,
  FolderKanban,
  Users,
  LibraryBig,
  FileText,
  Settings,
  HelpCircle,
  Search,
} from "lucide-react";

type Props = {
  children: ReactNode;
  rightHeader?: ReactNode;
  credits?: number;
  sidebarTitle?: string;
};

const NavItem = ({
  icon: Icon,
  label,
  active = false,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) => (
  <div
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer",
      active
        ? "bg-secondary text-foreground"
        : "text-muted-foreground hover:bg-secondary/60"
    )}
  >
    <Icon className="h-4 w-4" />
    <span className="text-sm">{label}</span>
  </div>
);

export default function AppShell({
  children,
  rightHeader,
  credits = 0,
  sidebarTitle = "TRUSTUP",
}: Props) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 border-r">
        <div className="h-14 flex items-center px-4">
          <span className="font-semibold">{sidebarTitle}</span>
        </div>
        <Separator />
        <ScrollArea className="h-[calc(100vh-56px)] p-3">
          <div className="space-y-6">
            <div className="space-y-1">
              <NavItem icon={Gauge} label="Dashboard" active />
              <NavItem icon={BarChart3} label="Analytics" />
              <NavItem icon={FolderKanban} label="Projects" />
              <NavItem icon={Users} label="Team" />
            </div>
            <div>
              <div className="px-3 mb-2 text-xs uppercase text-muted-foreground">
                Documents
              </div>
              <div className="space-y-1">
                <NavItem icon={LibraryBig} label="Data Library" />
                <NavItem icon={FileText} label="Reports" />
              </div>
            </div>
            <div className="space-y-1">
              <NavItem icon={Settings} label="Settings" />
              <NavItem icon={HelpCircle} label="Get Help" />
              <NavItem icon={Search} label="Search" />
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Content */}
      <main className="flex-1">
        <div className="h-14 border-b flex items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">Quick Create</div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="rounded-xl">
              Credits: {credits}
            </Badge>
            {rightHeader}
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
