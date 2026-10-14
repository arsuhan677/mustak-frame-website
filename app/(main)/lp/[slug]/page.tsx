import LandingPageView from "@/components/LandingPage/LandingPage";
import { createClient } from "@/utils/supabase/client";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://mustak-frame.vercel.app";

  try {
    const supabase = createClient();
    const { data: page } = await supabase
      .from("landing_pages")
      .select("title, hero_title, hero_subtitle, hero_image")
      .eq("slug", slug)
      .maybeSingle();

    if (page) {
      const title = page.hero_title || page.title;
      const description =
        page.hero_subtitle ||
        "Special Offer - Order now with cash on delivery.";
      const images = page.hero_image ? [page.hero_image] : ["/og-image.png"];

      return {
        title: `${title} | Nijumbd`,
        description,
        openGraph: {
          title: `${title} | Nijumbd`,
          description,
          url: `${baseUrl}/lp/${slug}`,
          type: "website",
          images: images.map((img) => ({ url: img, alt: title })),
        },
      };
    }
  } catch (e) {
    // fallback
  }

  return {
    title: "Special Offer | Nijumbd",
    description: "Exclusive online offer with cash on delivery across Bangladesh.",
  };
}

export default async function LandingSlugPage({ params }: Props) {
  const { slug } = await params;
  return <LandingPageView slug={slug} />;
}
