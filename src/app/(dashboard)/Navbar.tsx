"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { Menu, X, LogOut, User, BarChart3, PlusCircle, LayoutDashboard } from "lucide-react";
import { logout } from "../(auth)/actions";

interface NavbarProps {
    userEmail?: string | null;
    isAdmin: boolean;
}

export default function Navbar({ userEmail, isAdmin }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: "/demandes", label: "Mes demandes", icon: LayoutDashboard },
        { href: "/nouvelle-demande", label: "Nouvelle demande", icon: PlusCircle },
        { href: "/profil", label: "Profil", icon: User },
        { href: "/stats", label: "Stats", icon: BarChart3 },
    ];

    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Logo size="sm" href="/demandes" />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="flex items-center gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.href)
                                            ? "bg-orange-50 text-orange-600 shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-orange-500"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Actions (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAdmin && (
                            <Link
                                href="/admin/demandes"
                                className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 border border-red-100 hover:bg-red-100 transition"
                            >
                                ADMIN
                            </Link>
                        )}
                        <div className="h-8 w-px bg-gray-200 mx-1" />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Compte</span>
                            <span className="text-xs text-gray-700 font-medium">{userEmail}</span>
                        </div>
                        <form action={logout}>
                            <button
                                type="submit"
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Déconnexion"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </form>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                        {isAdmin && (
                            <Link
                                href="/admin/demandes"
                                className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 border border-red-100"
                            >
                                ADMIN
                            </Link>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-xl transition-all duration-300 transform ${isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
                    }`}
            >
                <div className="px-4 py-6 space-y-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl mb-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <User className="w-6 h-6" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">{userEmail}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Utilisateur</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${isActive(link.href)
                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                                        : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <link.icon className={`w-5 h-5 ${isActive(link.href) ? "text-white" : "text-gray-400"}`} />
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <form action={logout}>
                            <button
                                type="submit"
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-red-600 hover:bg-red-50 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Déconnexion
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </nav>
    );
}
