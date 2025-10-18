import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

export function GenresSidebar() {
  const { data: genresData, isLoading } = useQuery({
    queryKey: ["genres-count"],
    queryFn: async () => {
      const { data, error } = await supabase.
      from("videos").
      select("genre");

      if (error) throw error;

      // Count genres
      const genreCount: Record<string, number> = {};
      data.forEach((video) => {
        if (video.genre) {
          const genres = video.genre.split(",").map((g: string) => g.trim());
          genres.forEach((genre: string) => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          });
        }
      });

      // Sort by count
      return Object.entries(genreCount).
      sort(([, a], [, b]) => b - a).
      map(([genre, count]) => ({ genre, count }));
    }
  });

  return (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="text-lg font-bold mb-4">Genres</h3>
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {isLoading ?
          <>
              {[...Array(10)].map((_, i) =>
            <div key={i} className="animate-pulse flex justify-between items-center">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-4 bg-muted rounded w-8" />
                </div>
            )}
            </> :

          genresData?.map(({ genre, count }) =>
          <Link
            key={genre}
            to={`/?search=${encodeURIComponent(genre)}`}
            className="flex justify-between items-center hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-colors group">

                <span className="text-sm group-hover:font-medium">{genre}</span>
                <Badge variant="secondary" className="ml-2">
                  {count}
                </Badge>
              </Link>
          )
          }
        </div>
      </ScrollArea>
    </div>);

}