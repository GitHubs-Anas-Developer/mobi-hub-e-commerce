import HomeClient from "@/components/home/HomeClient";
import { canonicalUrl } from "@/lib/seo";

export const metadata = {
  alternates: { canonical: canonicalUrl("/") },
};

export default function HomePage() {
  return <HomeClient />;
}
