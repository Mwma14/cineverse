import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

export function BottomHeader() {
  const { data: ads } = useQuery({
    queryKey: ["advertisements", "bottom_header"],
    queryFn: async () => {
      const { data, error } = await supabase.
      from("advertisements" as any).
      select("*").
      eq("placement", "bottom_header").
      eq("is_active", true).
      order("display_order", { ascending: true }).
      limit(1);

      if (error) throw error;
      return data;
    }
  });

  const ad: any = ads?.[0];

  // If no ad, show fallback placeholder
  if (!ad) {
    return (
      <div className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 py-3 shadow-lg border-b-2 border-border mx-4 sm:mx-6 lg:mx-8">
        <div className="container relative px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="text-center max-w-md mx-auto">
            <p className="text-white/90 mb-3 text-sm md:text-base font-medium">
              Advertisement Space
            </p>
            <Button asChild variant="secondary" size="sm">
              <a
                href="https://t.me/ceo_metaverse"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2">

                <ExternalLink className="h-4 w-4" />
                Advertise with us
              </a>
            </Button>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg border-b-2 border-primary/20 mx-4 sm:mx-6 lg:mx-8">
      <div className="container relative py-1 md:py-2 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <a
          href={ad.target_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative overflow-hidden rounded-lg group mx-2 sm:mx-4">

          {/* Media content */}
          <div className="relative rounded-lg overflow-hidden">
            {ad.media_type === "video" ?
            <video
              src={ad.image_url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-20 md:h-24 object-contain transition-transform duration-300 group-hover:scale-105"
              preload="auto">

                Your browser does not support the video tag.
              </video> :

            <img
              src={ad.image_url}
              alt={ad.title || "Advertisement"}
              className="w-full h-20 md:h-24 object-contain transition-transform duration-300 group-hover:scale-105" />

            }
          </div>
        </a>
      </div>
    </div>);

}