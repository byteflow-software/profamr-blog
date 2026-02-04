"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Search, ChevronDown, Zap } from "lucide-react";
import styles from "./Header.module.css";

interface NavItem {
  name: string;
  slug: string;
  href: string;
  children?: { name: string; slug: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "Processo Penal",
    slug: "processo-penal",
    href: "/blog?categoria=processo-penal",
    children: [
      {
        name: "Prova Digital",
        slug: "prova-digital",
        href: "/blog?categoria=prova-digital",
      },
    ],
  },
  {
    name: "Tecnologias",
    slug: "tecnologias",
    href: "/blog?categoria=tecnologias",
  },
  { name: "IAGen", slug: "iagen", href: "/blog?categoria=iagen" },
  { name: "Artigos", slug: "artigos", href: "/blog?categoria=artigos" },
  { name: "Notícias", slug: "noticias", href: "/blog?categoria=noticias" },
  {
    name: "RoadmapCrime",
    slug: "roadmapcrime",
    href: "/blog?categoria=roadmapcrime",
  },
  { name: "Recursos", slug: "recursos", href: "/blog?categoria=recursos" },
];

interface HeaderProps {
  tickerHeadlines?: { title: string; slug: string }[];
}

export function Header({ tickerHeadlines }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }) +
          "  " +
          now.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!tickerHeadlines || tickerHeadlines.length <= 1) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerHeadlines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tickerHeadlines]);

  return (
    <>
      {/* Top Bar - Data/hora e redes sociais */}
      <div className={styles.topBar}>
        <div className={styles.topContainer}>
          <span className={styles.dateTime}>{currentTime}</span>
          <div className={styles.social}>
            <a href="#" aria-label="Facebook">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header - Logo */}
      <div className={styles.logoBar}>
        <div className={styles.logoContainer}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/images/prof_amr_logo.png"
              alt="Prof.AMR"
              width={180}
              height={60}
              className={styles.logoImage}
              priority
            />
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <button
            className={styles.menuToggle}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}>
            {NAV_ITEMS.map((item) => (
              <div
                key={item.slug}
                className={styles.navItem}
                onMouseEnter={() =>
                  item.children ? setOpenDropdown(item.slug) : undefined
                }
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={styles.navLink}
                  onClick={(e) => {
                    if (item.children && isMenuOpen) {
                      e.preventDefault();
                      setOpenDropdown(
                        openDropdown === item.slug ? null : item.slug,
                      );
                    } else {
                      setIsMenuOpen(false);
                    }
                  }}
                >
                  {item.name}
                  {item.children && (
                    <ChevronDown size={12} className={styles.navChevron} />
                  )}
                </Link>
                {item.children && openDropdown === item.slug && (
                  <div className={styles.dropdown}>
                    {item.children.map((child) => (
                      <Link
                        key={child.slug}
                        href={child.href}
                        className={styles.dropdownLink}
                        onClick={() => {
                          setIsMenuOpen(false);
                          setOpenDropdown(null);
                        }}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/wiki"
              className={`${styles.navLink} ${styles.navLinkWiki}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Wiki
            </Link>
          </nav>

          <button
            className={styles.searchBtn}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Buscar"
          >
            <Search size={18} />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className={styles.searchBar}>
          <form action="/busca" method="GET" className={styles.searchForm}>
            <Search className={styles.searchIcon} size={16} />
            <input
              type="search"
              name="q"
              placeholder="Buscar artigos, termos jurídicos..."
              className={styles.searchInput}
              autoFocus
            />
          </form>
        </div>
      )}

      {/* News Ticker */}
      <div className={styles.ticker}>
        <div className={styles.tickerLabel}>
          <Zap size={14} />
          <span>NEWS</span>
        </div>
        {/* Desktop: horizontal scroll - duplicado para animação infinita */}
        <div className={styles.tickerContent}>
          {tickerHeadlines && tickerHeadlines.length > 0 ? (
            <div className={styles.tickerTrack}>
              {/* Primeira cópia */}
              <div className={styles.tickerItems}>
                {tickerHeadlines.map((h, i) => (
                  <span key={`a-${h.slug}`}>
                    <Link
                      href={`/blog/${h.slug}`}
                      className={styles.tickerLink}
                    >
                      {h.title}
                    </Link>
                    <span className={styles.tickerSeparator}> • </span>
                  </span>
                ))}
              </div>
              {/* Segunda cópia para loop contínuo */}
              <div className={styles.tickerItems}>
                {tickerHeadlines.map((h, i) => (
                  <span key={`b-${h.slug}`}>
                    <Link
                      href={`/blog/${h.slug}`}
                      className={styles.tickerLink}
                    >
                      {h.title}
                    </Link>
                    <span className={styles.tickerSeparator}> • </span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className={styles.tickerFallback}>
              Acompanhe as últimas atualizações sobre direito, tecnologia e
              processo penal.
            </p>
          )}
        </div>
        {/* Mobile: vertical, one at a time */}
        {tickerHeadlines && tickerHeadlines.length > 0 && (
          <div className={styles.tickerMobile}>
            <Link
              key={tickerHeadlines[tickerIndex]?.slug}
              href={`/blog/${tickerHeadlines[tickerIndex]?.slug}`}
              className={styles.tickerMobileLink}
            >
              {tickerHeadlines[tickerIndex]?.title}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
