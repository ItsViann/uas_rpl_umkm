import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    ShoppingCart,
    Package,
    Receipt,
    Database,
    Users,
    TrendingUp,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, pos, inventaris } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props;
    const role = auth.user?.role;

    const mainNavItems: NavItem[] = [];

    if (role === 'owner') {
        mainNavItems.push({
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        });
    }

    if (role === 'owner' || role === 'kasir') {
        mainNavItems.push({
            title: 'POS Kasir',
            href: pos(),
            icon: ShoppingCart,
        });
        mainNavItems.push({
            title: 'Penjualan',
            href: '/penjualan',
            icon: Receipt,
        });
    }

    if (role === 'owner') {
        mainNavItems.push({
            title: 'Inventaris',
            href: inventaris(),
            icon: Package,
        });
        mainNavItems.push({
            title: 'Riwayat Stok',
            href: '/stok-log',
            icon: Database,
        });
        mainNavItems.push({
            title: 'Kelola Staf',
            href: '/staf',
            icon: Users,
        });
        mainNavItems.push({
            title: 'Laporan',
            href: '/laporan',
            icon: TrendingUp,
        });
    }

    const footerNavItems: NavItem[] = [
        // {
        //     title: 'Repository',
        //     href: 'https://github.com/laravel/react-starter-kit',
        //     icon: FolderGit2,
        // },
        // {
        //     title: 'Documentation',
        //     href: 'https://laravel.com/docs/starter-kits#react',
        //     icon: BookOpen,
        // },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
