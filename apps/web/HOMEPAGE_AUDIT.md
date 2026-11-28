# ELENZO Homepage UI/UX Audit

**Phase:** 1 — architecture and component audit  
**Date:** 2026-11-28  
**Status:** Audit complete. No homepage implementation files were changed during this phase.

## 1. Homepage composition

The storefront shell in `src/components/layout/AppShell.js` renders the announcement bar, shared navbar, current route, footer, and mobile bottom navigation. The home route in `src/app/page.js` is a client component that fetches product groups and composes these sections:

1. Home category quick navigation
2. Hero banner with optional featured product spotlight
3. Trust bar
4. Category discovery
5. Brand partners
6. Featured products
7. Middle promotional banner
8. Best Sellers & Top Picks
9. New Arrivals
10. Recently viewed products
11. Product videos
12. Why Shop with ELENZO
13. Bottom promotional banner
14. Newsletter
15. Mini cart drawer

## 2. Component audit

| Area | Current implementation | Audit notes |
|---|---|---|
| Header | `layout/Navbar.js`, `layout/navbar/*`, `search/SearchBar.jsx`, `home/AnnouncementBar.jsx`, `layout/BottomNavigation.jsx` | Sticky main header; desktop links, account/cart/wishlist actions, mobile menu, full-screen mobile search, and fixed bottom navigation are present. Search already supports debounced live suggestions, keyboard selection, recent searches, and URL synchronization. Keep these behaviors while changing presentation. The desktop primary links appear at the `xl` breakpoint. |
| Category navigation | `home/HomeCategoryNav.jsx`, `home/CategorySection.jsx`, `home/CategoryDropdown.jsx` | Homepage strip and category cards use active Redux categories. Category navigation is presented in more than one place. `CategoryDropdown.jsx` has no current import/use site and appears orphaned. `CategorySkeleton.jsx` also has no current import/use site; `CategorySection` defines its own card skeleton. Category links use more than one valid route pattern, so the redesign should preserve and verify intended destinations. |
| Hero | `home/HeroBanner.jsx` | Reads admin-managed hero banners and supports desktop/mobile banner assets, CTA links, carousel controls, a loading skeleton, and a real featured-product spotlight. With no banner configured it falls back to a text-only blue gradient; that fallback does not meet the requested campaign photography direction. The banner and spotlight use native `<img>` elements. |
| Categories | `home/CategorySection.jsx` | Uses API-backed Redux categories, active parent categories, image cards, loading/error/empty states, and a responsive 2/3/6-column grid. Images use native `<img>` elements. |
| Brands | `brands/BrandSection.jsx` | Uses active API-backed brands from Redux, `next/image`, and a marquee. It has a loading state and hides itself when no active brands exist. |
| Product sections | `home/ProductSection.jsx`, `home/ProductCard.jsx`, `home/ProductSkeleton.jsx` | Cards already support real product names/images/prices/discounts/ratings/stock, product navigation, wishlist actions, add-to-cart, loading/error/empty states, and authentication redirects. `ProductSection` is also reused by recently viewed and related-products surfaces; preserve its shared prop contract and cart/wishlist behavior. Product images currently use native `<img>` elements. |
| Promotions | `home/HomePromoSlider.jsx`, `home/PromotionalBanners.jsx`, `home/BottomPromotionalBanner.jsx` | Middle and bottom wrappers use the active banner API by placement and support mobile assets, text, and CTAs. Empty/loading states currently render no section, avoiding a blank placeholder. |
| Trust / benefits | `home/TrustBar.jsx`, `home/WhyChooseUs.jsx` | Both present overlapping payment, quality, returns, delivery/tracking, and support claims. Consolidate the message hierarchy while retaining only claims supported by current business behavior. |
| Videos | `home/ShopByVideos.jsx` | API-backed product-video carousel and modal with playback/error handling. At 639 lines, it is the largest home component and includes data loading, carousel, modal, and playback state in one file; review boundaries before expanding it. |
| Newsletter | `home/Newsletter.jsx` | Existing Redux thunk/API integration with client validation and loading/success/error feedback. Preserve the `/newsletter/subscribe` contract. |
| Footer | `layout/Footer.js`, `config/brand.js` | Includes brand assets, shop/support/policy links, support email, and copyright. Social links currently point to `#`; phone text is generic. There are no configured social URLs or payment marks in `brand.js`, so the redesign must not invent those details. |

## 3. Existing data and business logic

- **Products:** `src/app/page.js` makes three parallel `productService.getProducts` calls: featured products (`isFeatured`, limit 8), a newest-products batch (limit 16), and new arrivals (`isNewArrival`, newest, limit 8). “Best Sellers & Top Picks” is then derived by sorting only that 16-item newest batch by rating count and average. This is not a server-provided sales ranking and can misrepresent the label. The Redux `products` slice/thunks exist, but the homepage currently uses local component state and the same service directly.
- **Categories:** `fetchCategories` populates `state.categories`; `HomeCategoryNav`, `CategorySection`, and the unused dropdown each have an effect that can request categories when the store is empty. The first two can mount together, so an in-flight guard or shared request ownership should be considered to avoid duplicate requests.
- **Banners:** `fetchActiveBanners` reads `/banners/active` with `placement: "home"` and positions `hero`, `middle`, and `bottom`. The shared banner slice stores results by placement, but exposes one shared `loading` boolean across concurrent requests; parallel placement fetches can therefore report loading imprecisely.
- **Brands:** `BrandSection` consumes the Redux brands slice populated through the brand service/thunk.
- **Search:** The existing suggestion API is `/search/suggestions`; suggestions are held in Redux, with recent searches persisted in local storage.
- **Cart and wishlist:** Product cards call existing Redux thunks and require authentication. The mini cart opens after a successful homepage add-to-cart. Keep those integrations and redirect behavior intact.
- **Newsletter and videos:** Newsletter submission uses `/newsletter/subscribe`; product-video content uses the existing product-video Redux flow.

## 4. Styling and responsive review

- `src/app/globals.css` is an 850-line Tailwind v4/global stylesheet with ELENZO color, type, spacing, radius, shadow, and breakpoint tokens. The current working tree already contains token and layout edits. Homepage components still repeat many literal hex values and arbitrary Tailwind sizing instead of consistently using the shared tokens.
- Homepage styles are primarily Tailwind utility classes; there is no separate homepage stylesheet. Avoid a broad global CSS rewrite. Scope any normalization to the home/header components and only add reusable tokens where they reduce real duplication.
- Responsive behavior is encoded in utility breakpoints: section containers cap at 1440px, product grids grow from 2 to 3 to 4 columns, category grids from 2 to 3 to 6, the hero stacks on narrow widths, and the mobile shell provides menu/search overlays plus a bottom bar.
- This is a source-level responsive audit only. No browser rendering or viewport overflow checks have been run in Phase 1. The requested 360, 390, 768, 1366, 1440, and 1920px checks remain for the implementation/verification phase.
- `next.config.mjs` allows remote images from Cloudinary and Unsplash. Several homepage images currently bypass Next image optimization through native `<img>`/`<picture>` elements. Before converting them, confirm actual image hosts and preserve the mobile banner source behavior.
- Root metadata is configured in `src/app/layout.js`; the home route itself is client-rendered and performs its product fetches after mount. Preserve existing metadata while improving image loading and avoiding duplicated client requests.

## 5. Pre-existing working-tree changes

The repository already had uncommitted changes when this audit began. Homepage-adjacent modified files include `src/app/globals.css`, `src/app/layout.js`, `src/components/home/CategoryDropdown.jsx`, `src/components/home/ProductSection.jsx`, and `src/components/layout/BottomNavigation.jsx`. The working tree also contains unrelated auth, product-detail, and loading-state changes. These changes were not authored in Phase 1 and must be preserved when implementation starts.

## 6. Recommended implementation order after approval

1. Phase 2: establish a small, consistent storefront token usage pattern without rewriting the full global stylesheet.
2. Phase 3: refine the shared header, search, category navigation, and mobile navigation while preserving existing action/data behavior.
3. Phase 4: redesign the hero using the existing admin banner contract and a deliberate no-banner state.
4. Phase 5: refine category and brand discovery using API data only; remove or reuse orphan components.
5. Phase 6: refine shared product cards/sections without changing cart or wishlist contracts; correct the bestseller data semantics where the backend supports it.
6. Phases 7–8: selectively use existing promotion/video data, reduce duplicated trust messaging, then refine newsletter and footer using only configured contact/social data.
7. Phases 9–10: verify target viewports, accessibility, request behavior, lint/build, and production rendering after the implementation phases are approved.

