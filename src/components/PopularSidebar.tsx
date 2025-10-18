import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ScrollArea } from "./ui/scroll-area";
import { Calendar } from "lucide-react";

export function PopularSidebar() {
  const { data: popularVideos, isLoading } = useQuery({
    queryKey: ["popular-sidebar"],
    queryFn: async () => {
      const { data, error } = await supabase.
      from("videos").
      select("*").
      order("created_at", { ascending: false }).
      limit(10);

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="text-lg font-bold mb-4">Popular</h3>
      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {isLoading ?
          <>
              {[...Array(8)].map((_, i) =>
            <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-20 h-28 bg-muted rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
            )}
            </> :

          popularVideos?.map((video) =>
          <Link
            key={video.id}
            to={`/video/${video.id}`}
            className="flex gap-3 hover:bg-accent p-2 rounded-lg transition-colors group">

                <img
              src={video.poster_url}
              alt={video.title}
              className="w-20 h-28 object-cover rounded flex-shrink-0 group-hover:scale-105 transition-transform" />

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{video.year}</span>
                  </div>
                </div>
              </Link>
          )
          }
        </div>
      </ScrollArea>
    </div>);

}