
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Share2, Send } from "lucide-react";
import { Advertisement } from "./Advertisement";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";

export function DesktopSidebar() {
  const { data: genres } = useQuery({
    queryKey: ["genres-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos" as any)
        .select("genre");
      
      if (error) throw error;
      
      const genreCounts: Record<string, number> = {};
      data?.forEach((video: any) => {
        const videoGenres = video.genre?.split(',').map((g: string) => g.trim()) || [];
        videoGenres.forEach((genre: string) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      });
      
      return Object.entries(genreCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    }
  });

  const { data: popular } = useQuery({
    queryKey: ["popular-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos" as any)
        .select("*")
        .order("views", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <aside className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
      <div className="sticky top-4 space-y-6">
        {/* Share Buttons */}
        <Card className="p-4">
          <div className="flex gap-3">
            <Button 
              onClick={handleShare}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              size="lg"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              asChild
              className="flex-1 bg-cyan-500 hover:bg-cyan-600"
              size="lg"
            >
              <a 
                href="https://t.me/ceo_metaverse" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Send className="h-4 w-4 mr-2" />
                Telegram
              </a>
            </Button>
          </div>
        </Card>

        {/* Genres */}
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-4">Genres</h3>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {genres?.map((genre) => (
                <div 
                  key={genre.name}
                  className="flex justify-between items-center py-2 hover:bg-accent rounded px-2 cursor-pointer transition-colors"
                >
                  <span className="text-sm">{genre.name}</span>
                  <span className="text-sm text-muted-foreground">{genre.count}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Advertisement */}
        <Advertisement placement="sidebar" />

        {/* Popular */}
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-4">Popular</h3>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {popular?.map((video: any) => (
                <a
                  key={video.id}
                  href={`/video/${video.id}`}
                  className="flex gap-3 hover:bg-accent rounded p-2 transition-colors group"
                >
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-20 h-28 object-cover rounded flex-shrink-0 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2 mb-1">
                      {video.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(video.created_at).getFullYear()}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </aside>
  );
}
