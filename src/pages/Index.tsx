import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { VideoCard } from "@/components/VideoCard";

import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Tv, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const ITEMS_PER_PAGE = 20;

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  const filter = searchParams.get("filter"); // 'movies', 'series', or null for all
  const pageParam = searchParams.get("page");
  const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam) : 1);

  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos", searchQuery, currentPage, filter],
    queryFn: async () => {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase.from("videos").select("*", { count: "exact" }).order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,genre.ilike.%${searchQuery}%`);
      }

      if (filter === "movies") {
        query = query.eq("is_series", false);
      } else if (filter === "series") {
        query = query.eq("is_series", true);
      }

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      return { data, count };
    }
  });

  const allVideos = videos?.data || [];
  const totalCount = videos?.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const movies = allVideos.filter((v) => !v.is_series);
  const series = allVideos.filter((v) => v.is_series);

  // Get trending (recently added) content - limit to 10
  const trendingMovies = movies.slice(0, 10);
  const trendingSeries = series.slice(0, 10);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (totalPages <= 1 || !filter && !searchQuery) return null;

    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="gap-1">

            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>

          {pages.map((page, idx) =>
          page === "..." ?
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                ...
              </span> :

          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page as number)}
            className="min-w-[40px]">

                {page}
              </Button>

          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="gap-1">

            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
      </div>);

  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Main Content */}
      <section className="container py-12 space-y-12">
        {searchQuery ?
        <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Search results for "{searchQuery}"
              </h2>
              <p className="text-muted-foreground">Found {totalCount} results</p>
            </div>
            
            <Tabs defaultValue={movies.length > 0 ? "movies" : "series"} className="space-y-8">
              <TabsList>
                <TabsTrigger value="movies" className="space-x-2">
                  <Film className="h-4 w-4" />
                  <span>Movies</span>
                </TabsTrigger>
                <TabsTrigger value="series" className="space-x-2">
                  <Tv className="h-4 w-4" />
                  <span>TV Series</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="movies">
                {isLoading ?
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                    {[...Array(20)].map((_, i) =>
                <div key={i} className="animate-pulse">
                        <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                        <div className="h-4 bg-secondary rounded mb-2" />
                        <div className="h-3 bg-secondary rounded w-2/3" />
                      </div>
                )}
                  </div> :
              movies.length > 0 ?
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                    {movies.map((video) =>
                  <VideoCard
                    key={video.id}
                    id={video.id}
                    title={video.title}
                    year={video.year}
                    rating={video.rating}
                    genre={video.genre}
                    posterUrl={video.poster_url} />

                  )}
                  </div>
                  {renderPagination()}
                </> :

              <div className="text-center py-12">
                    <p className="text-muted-foreground">No movies found</p>
                  </div>
              }
              </TabsContent>

              <TabsContent value="series">
                {isLoading ?
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                    {[...Array(20)].map((_, i) =>
                <div key={i} className="animate-pulse">
                        <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                        <div className="h-4 bg-secondary rounded mb-2" />
                        <div className="h-3 bg-secondary rounded w-2/3" />
                      </div>
                )}
                  </div> :
              series.length > 0 ?
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                    {series.map((video) =>
                  <VideoCard
                    key={video.id}
                    id={video.id}
                    title={video.title}
                    year={video.year}
                    rating={video.rating}
                    genre={video.genre}
                    posterUrl={video.poster_url}
                    isSeries={video.is_series}
                    seasons={video.seasons} />

                  )}
                  </div>
                  {renderPagination()}
                </> :

              <div className="text-center py-12">
                    <p className="text-muted-foreground">No series found</p>
                  </div>
              }
              </TabsContent>
            </Tabs>
          </> :
        filter === 'movies' ?
        <>
            {/* Movies Only View */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Film className="h-7 w-7 text-primary" />
                  All Movies
                </h2>
              </div>
              {isLoading ?
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                  {[...Array(20)].map((_, i) =>
              <div key={i} className="animate-pulse">
                      <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                      <div className="h-4 bg-secondary rounded mb-2" />
                      <div className="h-3 bg-secondary rounded w-2/3" />
                    </div>
              )}
                </div> :
            allVideos.length > 0 ?
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                  {allVideos.map((video) =>
                <VideoCard
                  key={video.id}
                  id={video.id}
                  title={video.title}
                  year={video.year}
                  rating={video.rating}
                  genre={video.genre}
                  posterUrl={video.poster_url} />

                )}
                </div>
                {renderPagination()}
              </> :

            <div className="text-center py-12">
                  <p className="text-muted-foreground">No movies available</p>
                </div>
            }
            </div>
          </> :
        filter === 'series' ?
        <>
            {/* Series Only View */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Tv className="h-7 w-7 text-primary" />
                  All Series
                </h2>
              </div>
              {isLoading ?
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                  {[...Array(20)].map((_, i) =>
              <div key={i} className="animate-pulse">
                      <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                      <div className="h-4 bg-secondary rounded mb-2" />
                      <div className="h-3 bg-secondary rounded w-2/3" />
                    </div>
              )}
                </div> :
            allVideos.length > 0 ?
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                  {allVideos.map((video) =>
                <VideoCard
                  key={video.id}
                  id={video.id}
                  title={video.title}
                  year={video.year}
                  rating={video.rating}
                  genre={video.genre}
                  posterUrl={video.poster_url}
                  isSeries={video.is_series}
                  seasons={video.seasons} />

                )}
                </div>
                {renderPagination()}
              </> :

            <div className="text-center py-12">
                  <p className="text-muted-foreground">No series available</p>
                </div>
            }
            </div>
          </> :

        <>
            {/* Trending Movies */}
            {trendingMovies.length > 0 &&
          <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-7 w-7 text-primary" />
                    Trending Movies
                  </h2>
                  <Button asChild variant="ghost">
                    <Link to="/?filter=movies">View All</Link>
                  </Button>
                </div>
                {isLoading ?
            <div className="grid grid-cols-3 gap-3 md:gap-6">
                    {[...Array(5)].map((_, i) =>
              <div key={i} className="animate-pulse">
                        <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                        <div className="h-4 bg-secondary rounded mb-2" />
                        <div className="h-3 bg-secondary rounded w-2/3" />
                      </div>
              )}
                  </div> :

            <div className="grid grid-cols-3 gap-3 md:gap-6">
                    {trendingMovies.map((video) =>
              <VideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                year={video.year}
                rating={video.rating}
                genre={video.genre}
                posterUrl={video.poster_url} />

              )}
                  </div>
            }
              </div>
          }

            {/* Trending Series */}
            {trendingSeries.length > 0 &&
          <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-7 w-7 text-primary" />
                    Trending Series
                  </h2>
                  <Button asChild variant="ghost">
                    <Link to="/?filter=series">View All</Link>
                  </Button>
                </div>
                {isLoading ?
            <div className="grid grid-cols-3 gap-3 md:gap-6">
                    {[...Array(5)].map((_, i) =>
              <div key={i} className="animate-pulse">
                        <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                        <div className="h-4 bg-secondary rounded mb-2" />
                        <div className="h-3 bg-secondary rounded w-2/3" />
                      </div>
              )}
                  </div> :

            <div className="grid grid-cols-3 gap-3 md:gap-6">
                    {trendingSeries.map((video) =>
              <VideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                year={video.year}
                rating={video.rating}
                genre={video.genre}
                posterUrl={video.poster_url}
                isSeries={video.is_series}
                seasons={video.seasons} />

              )}
                  </div>
            }
              </div>
          }

            {/* All Movies Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Film className="h-7 w-7 text-primary" />
                  Movies
                </h2>
                <Button asChild variant="ghost">
                  <Link to="/?filter=movies">View All</Link>
                </Button>
              </div>
              {isLoading ?
            <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {[...Array(10)].map((_, i) =>
              <div key={i} className="animate-pulse">
                      <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                      <div className="h-4 bg-secondary rounded mb-2" />
                      <div className="h-3 bg-secondary rounded w-2/3" />
                    </div>
              )}
                </div> :
            movies.length > 0 ?
            <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {movies.slice(0, 10).map((video) =>
              <VideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                year={video.year}
                rating={video.rating}
                genre={video.genre}
                posterUrl={video.poster_url} />

              )}
                </div> :

            <div className="text-center py-12">
                  <p className="text-muted-foreground">No movies available</p>
                </div>
            }
            </div>

            {/* All Series Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Tv className="h-7 w-7 text-primary" />
                  Series
                </h2>
                <Button asChild variant="ghost">
                  <Link to="/?filter=series">View All</Link>
                </Button>
              </div>
              {isLoading ?
            <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {[...Array(10)].map((_, i) =>
              <div key={i} className="animate-pulse">
                      <div className="aspect-[2/3] bg-secondary rounded-lg mb-4" />
                      <div className="h-4 bg-secondary rounded mb-2" />
                      <div className="h-3 bg-secondary rounded w-2/3" />
                    </div>
              )}
                </div> :
            series.length > 0 ?
            <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {series.slice(0, 10).map((video) =>
              <VideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                year={video.year}
                rating={video.rating}
                genre={video.genre}
                posterUrl={video.poster_url}
                isSeries={video.is_series}
                seasons={video.seasons} />

              )}
                </div> :

            <div className="text-center py-12">
                  <p className="text-muted-foreground">No series available</p>
                </div>
            }
            </div>


          </>
        }
      </section>

      {/* Bottom spacing for sticky ad */}
      <div className="h-24" />
    </div>);

};

export default Index;