import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

export function StickyAd() {

  const { data: ads } = useQuery({
    queryKey: ["advertisements", "sticky"],
    queryFn: async () => {
      const { data, error } = await supabase.
      from("advertisements" as any).
      select("*").
      eq("placement", "sticky").
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
      <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom duration-500">
        <div className="relative bg-secondary/95 backdrop-blur-sm border-t-2 border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="container relative py-4 px-4">
            {/* Placeholder content */}
            <div className="text-center max-w-md mx-auto">
              <p className="text-muted-foreground mb-3 text-sm md:text-base">Advertisement Space</p>
              <Button asChild variant="outline" size="sm">
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
        </div>
      </div>);

  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom duration-500">
      {/* Animated border glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse opacity-75"></div>
      
      {/* Main container with gradient background */}
      <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 border-t-4 border-yellow-400 shadow-[0_-4px_20px_rgba(236,72,153,0.5)]">
        <div className="container relative py-2 px-3 md:py-3 md:px-4">
          {/* Ad content with shimmer effect */}
          <a
            href={ad.target_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative overflow-hidden rounded-lg group">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent z-10"></div>
            
            {/* Border animation */}
            <div className="absolute inset-0 rounded-lg border-2 border-white/50 animate-pulse"></div>
            
            {/* Media content */}
            <div className="relative bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
              {ad.media_type === 'video' ?
              <video
                src={ad.image_url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-24 md:h-28 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                preload="auto">
                  Your browser does not support the video tag.
                </video> :
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-24 md:h-28 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105" />
              }
              
              {/* Overlay text if title exists */}
              {ad.title &&
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 md:p-3">
                  <p className="text-white font-bold text-sm md:text-lg text-center drop-shadow-lg animate-pulse">
                    {ad.title}
                  </p>
                </div>
              }
            </div>
          </a>
        </div>
      </div>
      
      {/* Bottom glow effect */}
      <div className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 blur-sm"></div>
    </div>);

}