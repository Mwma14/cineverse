import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";

export function SidebarAds() {
  const { data: ad } = useQuery({
    queryKey: ["sidebarAd"],
    queryFn: async () => {
      // First, try to get desktop_sidebar ad
      const { data: desktopAd, error: desktopError } = await supabase.
      from("advertisements" as any).
      select("*").
      eq("is_active", true).
      eq("placement", "desktop_sidebar").
      order("display_order", { ascending: true }).
      limit(1).
      maybeSingle();

      if (desktopError && desktopError.code !== 'PGRST116') {
        throw desktopError;
      }

      // If desktop_sidebar ad exists, return it
      if (desktopAd) {
        return desktopAd;
      }

      // Otherwise, fallback to sidebar ad
      const { data: sidebarAd, error: sidebarError } = await supabase.
      from("advertisements" as any).
      select("*").
      eq("is_active", true).
      eq("placement", "sidebar").
      order("display_order", { ascending: true }).
      limit(1).
      maybeSingle();

      if (sidebarError && sidebarError.code !== 'PGRST116') {
        throw sidebarError;
      }

      return sidebarAd || null;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  if (!ad) {
    return (
      <div className="bg-card rounded-lg border p-4">
        <div className="bg-secondary/50 rounded-lg p-6 text-center border-2 border-dashed border-border">
          <p className="text-muted-foreground text-sm mb-3">Advertisement Space</p>
          <Button asChild variant="outline" size="sm">
            <a
              href="https://t.me/ceo_metaverse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2">
              <ExternalLink className="h-3 w-3" />
              Advertise with us
            </a>
          </Button>
        </div>
      </div>);

  }

  return (
    <a
      href={ad.target_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
      title={ad.alt_text || ad.title}>
      {ad.media_type === 'video' ?
      <video
        src={ad.image_url}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto object-cover"
        preload="auto">
          Your browser does not support the video tag.
        </video> :

      <img
        src={ad.image_url}
        alt={ad.alt_text || ad.title}
        className="w-full h-auto object-cover" />
      }
    </a>);

}