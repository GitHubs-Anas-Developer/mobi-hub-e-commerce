
"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Menu, X } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/store/thunks/authThunks";
import { fetchUnreadCount } from "@/store/thunks/notificationThunks";

import Logo from "./navbar/Logo";
import SearchBar from "./navbar/SearchBar";
import HeaderActions from "./navbar/HeaderActions";
import MobileMenu from "./navbar/MobileMenu";

import LoginModal from "../../app/login/LoginModal";
import RegisterModal from "../../app/register/RegisterModal";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    user,
    isAuthenticated,
    isInitialized,
    dispatch,
  } = useAuth();

  const reduxDispatch = useDispatch();

  /* =====================================
     REDUX STATE
  ===================================== */

  const cartItems = useSelector(
    (state) => state.cart?.items ?? []
  );

  const wishlistProducts = useSelector(
    (state) => state.wishlist?.products ?? []
  );

  const unreadCount = useSelector(
    (state) => state.notifications?.unreadCount ?? 0
  );

  /* =====================================
     LOCAL STATE
  ===================================== */

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // null | "login" | "register"
  const [authModal, setAuthModal] = useState(null);

  /* =====================================
     AUTH MODAL HANDLERS
  ===================================== */

  const openLogin = useCallback(() => {
    setMobileMenuOpen(false);
    setAuthModal("login");
  }, []);

  const openRegister = useCallback(() => {
    setMobileMenuOpen(false);
    setAuthModal("register");
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal(null);
  }, []);

  const switchToLogin = useCallback(() => {
    setAuthModal("login");
  }, []);

  const switchToRegister = useCallback(() => {
    setAuthModal("register");
  }, []);

  /* =====================================
     HYDRATION FIX
  ===================================== */

  useEffect(() => {
    setMounted(true);
  }, []);

  const authenticated = Boolean(
    mounted && isInitialized && isAuthenticated
  );

  /* =====================================
     COUNTS
  ===================================== */

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + (Number(item.quantity) || 0),
    0
  );

  const wishlistCount = wishlistProducts.length;

  /* =====================================
     FETCH NOTIFICATIONS
  ===================================== */

  useEffect(() => {
    if (!mounted || !isInitialized || !isAuthenticated) {
      return;
    }

    reduxDispatch(fetchUnreadCount());
  }, [
    mounted,
    isInitialized,
    isAuthenticated,
    reduxDispatch,
  ]);

  /* =====================================
     BOTTOM NAVIGATION AUTH EVENT
  ===================================== */

  useEffect(() => {
    const handleOpenAuthModal = (event) => {
      if (event.detail?.modal === "login") {
        openLogin();
      }

      if (event.detail?.modal === "register") {
        openRegister();
      }
    };

    window.addEventListener(
      "open-auth-modal",
      handleOpenAuthModal
    );

    return () => {
      window.removeEventListener(
        "open-auth-modal",
        handleOpenAuthModal
      );
    };
  }, [openLogin, openRegister]);

  /* =====================================
     CLOSE MOBILE MENU ON NAVIGATION
  ===================================== */

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  /* =====================================
     SEARCH
  ===================================== */

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    if (!value) return;

    router.push(
      `/products?search=${encodeURIComponent(value)}`
    );

    setSearch("");
    setMobileMenuOpen(false);
  };

  /* =====================================
     LOGOUT
  ===================================== */

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      setMobileMenuOpen(false);

      // Open login modal after logout
      setAuthModal("login");

      // Redirect to homepage
      if (pathname !== "/") {
        router.replace("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /* =====================================
     RENDER
  ===================================== */

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">

        <div className="mx-auto px-3 sm:px-6 lg:px-8">

          <div className="flex h-[68px] items-center justify-between gap-2 sm:h-[72px] sm:gap-3 lg:gap-6">

            {/* LEFT: MOBILE MENU + LOGO */}

            <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen((prev) => !prev)
                }
                aria-label={
                  mobileMenuOpen ? "Close menu" : "Open menu"
                }
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600 xl:hidden"
              >
                {mobileMenuOpen ? (
                  <X size={22} />
                ) : (
                  <Menu size={22} />
                )}
              </button>

              <Logo />

            </div>

            {/* DESKTOP SEARCH */}

            <div className="hidden min-w-0 max-w-[600px] flex-1 xl:block">

              <SearchBar
                search={search}
                setSearch={setSearch}
                onSubmit={handleSearch}
              />

            </div>

            {/* HEADER ACTIONS */}

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">

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
