"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, ArrowLeft } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/store/thunks/authThunks";
import { fetchUnreadCount } from "@/store/thunks/notificationThunks";

import Logo from "./navbar/Logo";
import SearchBar from "@/components/search/SearchBar";
import HeaderActions from "./navbar/HeaderActions";
import MobileMenu from "./navbar/MobileMenu";

import LoginModal from "../../app/login/LoginModal";
import RegisterModal from "../../app/register/RegisterModal";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const { user, isAuthenticated, isInitialized, dispatch } = useAuth();

  const reduxDispatch = useDispatch();

  // REDUX STATE
  const cartItems = useSelector((state) => state.cart?.items ?? []);

  const wishlistProducts = useSelector(
    (state) => state.wishlist?.products ?? [],
  );

  const unreadCount = useSelector(
    (state) => state.notifications?.unreadCount ?? 0,
  );

  // LOCAL STATE
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // null | "login" | "register"
  const [authModal, setAuthModal] = useState(null);

  // MOBILE SEARCH HANDLERS
  const openMobileSearch = useCallback(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(true);
  }, []);

  const closeMobileSearch = useCallback(() => {
    setMobileSearchOpen(false);
  }, []);

  // AUTH MODAL HANDLERS
  const openLogin = useCallback(() => {
    setMobileMenuOpen(false);
    closeMobileSearch();
    setAuthModal("login");
  }, [closeMobileSearch]);

  const openRegister = useCallback(() => {
    setMobileMenuOpen(false);
    closeMobileSearch();
    setAuthModal("register");
  }, [closeMobileSearch]);

  const closeAuthModal = useCallback(() => {
    setAuthModal(null);
  }, []);

  const switchToLogin = useCallback(() => {
    setAuthModal("login");
  }, []);

  const switchToRegister = useCallback(() => {
    setAuthModal("register");
  }, []);

  // HYDRATION FIX
  useEffect(() => {
    setMounted(true);
  }, []);

  const authenticated = Boolean(mounted && isInitialized && isAuthenticated);

  // COUNTS
  const cartCount = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  const wishlistCount = wishlistProducts.length;

  // FETCH NOTIFICATIONS
  useEffect(() => {
    if (!mounted || !isInitialized || !isAuthenticated) {
      return;
    }

    reduxDispatch(fetchUnreadCount());
  }, [mounted, isInitialized, isAuthenticated, reduxDispatch]);

  // BOTTOM NAVIGATION AUTH EVENT
  useEffect(() => {
    const handleOpenAuthModal = (event) => {
      if (event.detail?.modal === "login") {
        openLogin();
      }

      if (event.detail?.modal === "register") {
        openRegister();
      }
    };

    window.addEventListener("open-auth-modal", handleOpenAuthModal);

    return () => {
      window.removeEventListener("open-auth-modal", handleOpenAuthModal);
    };
  }, [openLogin, openRegister]);

  // CLOSE MENUS ON ROUTE CHANGE
  useEffect(() => {
    setMobileMenuOpen(false);
    closeMobileSearch();
  }, [pathname, closeMobileSearch]);

  // BODY SCROLL LOCK
  useEffect(() => {
    if (!mobileSearchOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSearchOpen]);

  // LOGOUT
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      setMobileMenuOpen(false);
      closeMobileSearch();

      setAuthModal("login");

      if (pathname !== "/") {
        router.replace("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // FRAMER MOTION VARIANTS
  const overlayVariants = {
    hidden: {
      opacity: 0,
      y: "100%",
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        when: "beforeChildren",
        staggerChildren: 0.07,
      },
    },
    exit: {
      opacity: 0,
      y: "100%",
      transition: {
        duration: 0.28,
        ease: [0.4, 0, 1, 1],
      },
    },
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: 15,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
        <div className="mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex h-[64px] items-center justify-between gap-2 sm:h-[72px] sm:gap-3 lg:gap-6">
            {/* LEFT: MOBILE MENU + LOGO */}
            <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                className="
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-xl border border-slate-200
                  text-slate-700
                  transition-all duration-200
                  hover:bg-blue-50 hover:text-blue-600
                  active:scale-95
                  xl:hidden
                "
              >
                {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>

              <Logo />
            </div>

            {/* DESKTOP SEARCH */}
            <div className="hidden min-w-0 max-w-[600px] flex-1 xl:block">
              <SearchBar />
            </div>

            {/* HEADER ACTIONS */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {/* MOBILE SEARCH BUTTON */}
              <button
                type="button"
                onClick={openMobileSearch}
                aria-label="Open search"
                aria-expanded={mobileSearchOpen}
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl text-slate-700
                  transition-all duration-200
                  hover:scale-105 hover:bg-blue-50 hover:text-blue-600
                  active:scale-95
                  xl:hidden
                "
              >
                <Search size={21} />
              </button>

              <HeaderActions
                user={authenticated ? user : null}
                isAuthenticated={authenticated}
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                unreadCount={unreadCount}
                onLogout={handleLogout}
                onLogin={openLogin}
                onRegister={openRegister}
              />
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className="relative">
          <MobileMenu
            isOpen={mobileMenuOpen}
            setIsOpen={setMobileMenuOpen}
            user={authenticated ? user : null}
            isAuthenticated={authenticated}
            cartCount={cartCount}
            wishlistCount={wishlistCount}
            unreadCount={unreadCount}
            onLogout={handleLogout}
            onLogin={openLogin}
            onRegister={openRegister}
          />
        </div>
      </header>

      {/* MOBILE FULL SCREEN SEARCH */}
      <AnimatePresence mode="wait">
        {mobileSearchOpen && (
          <motion.div
            key="mobile-search-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="
              fixed inset-0 z-[100]
              flex flex-col bg-white
              xl:hidden
            "
            role="dialog"
            aria-modal="true"
            aria-label="Product search"
          >
            {/* SEARCH HEADER */}
            <motion.div
              variants={childVariants}
              className="
                flex h-[64px] shrink-0 items-center gap-3
                border-b border-slate-100 px-3
              "
            >
              <button
                type="button"
                onClick={closeMobileSearch}
                aria-label="Close search"
                className="
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-full text-slate-700
                  transition-all duration-200
                  hover:scale-105 hover:bg-slate-100
                  active:scale-95
                "
              >
                <ArrowLeft size={22} />
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  Search Mobi Hub
                </p>

                <p className="text-xs text-slate-400">
                  Find your favourite accessories
                </p>
              </div>

              <button
                type="button"
                onClick={closeMobileSearch}
                aria-label="Close search"
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-full text-slate-400
                  transition-all duration-200
                  hover:rotate-90 hover:bg-slate-100
                "
              >
                <X size={19} />
              </button>
            </motion.div>

            {/* SEARCH INPUT AND SUGGESTIONS */}
            <motion.div
              variants={childVariants}
              className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
            >
              <SearchBar onSearchSubmit={closeMobileSearch} />
            </motion.div>

            {/* BOTTOM INFORMATION */}
            <motion.div
              variants={childVariants}
              className="shrink-0 border-t border-slate-100 px-4 py-3"
            >
              <p className="text-center text-xs text-slate-400">
                Discover products, brands and accessories at Mobi Hub
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL LOGIN MODAL */}
      <LoginModal
        isOpen={authModal === "login"}
        onClose={closeAuthModal}
        onSwitchToRegister={switchToRegister}
      />

      {/* GLOBAL REGISTER MODAL */}
      <RegisterModal
        isOpen={authModal === "register"}
        onClose={closeAuthModal}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
}
