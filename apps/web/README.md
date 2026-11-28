This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Production SEO

The public site URL defaults to `https://www.elenzo.in`. Set `NEXT_PUBLIC_SITE_URL`
to the canonical production origin in Vercel and set `NEXT_PUBLIC_API_URL` to the
public Express API base URL so product/category metadata, `sitemap.xml`, and the
Merchant Center feed can read the live catalog. Do not put private API credentials
in these public variables.

The API generates missing product SEO titles and descriptions from product details
and variant SKUs on creation and publication. Product pages use server-rendered
metadata, canonical URLs, and Product JSON-LD; out-of-stock products remain
eligible and advertise their actual availability. The sitemap reads the public
catalog without a Next.js fetch cache, so catalog changes are reflected on its
next request. Submitting the sitemap helps Google discover URLs but does not
guarantee that any URL is indexed.

Optional Search Console HTML-tag verification is supported through
`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`. Add the verification token provided by
Google to the Vercel production environment, deploy, and then complete verification
in Search Console. Submit `https://www.elenzo.in/sitemap.xml` after confirming it
loads. Verification, indexing, and search performance have not been completed by
this code change. The Google Indexing API is not used because ordinary product
pages are outside its supported use cases.

The Google Merchant Center RSS feed is available at
`https://www.elenzo.in/merchant-feed.xml`. Connect it in Merchant Center and
review all diagnostics before enabling listings. The current product model does
not store GTIN/MPN or product condition, so provide those attributes or confirm
applicable exemptions before relying on the feed for Shopping ads. Configure
shipping, tax, returns, and business details directly in Merchant Center.
