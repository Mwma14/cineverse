import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, Calendar, Clock, Share2, Download } from "lucide-react";
import { Header } from "@/components/Header";
import { Advertisement } from "@/components/Advertisement";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VideoDetailProps {
  onMobileMenuChange?: (isOpen: boolean) => void;
}

export default function VideoDetail({ onMobileMenuChange }: VideoDetailProps = {}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: video, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: relatedVideos } = useQuery({
    queryKey: ["relatedVideos", video?.genre],
    enabled: !!video?.genre,
    queryFn: async () => {
      const genres = video?.genre.split(",")[0].trim();
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .contains("genre", [genres])
        .neq("id", id)
        .limit(6);

      if (error) throw error;
      return data;
    }
  });

  const { data: cast } = useQuery({
    queryKey: ["cast", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_cast")
        .select("*")
        .eq("video_id", id);

      if (error) throw error;
      return data;
    }
  });

  const { data: downloadLinks } = useQuery({
    queryKey: ["downloadLinks", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("download_links")
        .select("*")
        .eq("video_id", id);

      if (error) throw error;
      return data;
    }
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video?.title,
          text: `Check out ${video?.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    }
  };

  const handleTelegram = () => {
    if (video?.telegram_link) {
      window.open(video.telegram_link, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMobileMenuChange={onMobileMenuChange} />
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-secondary rounded-lg mb-6" />
            <div className="h-8 bg-secondary rounded w-1/3 mb-4" />
            <div className="h-4 bg-secondary rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMobileMenuChange={onMobileMenuChange} />
        <div className="container py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Video not found</h2>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuChange={onMobileMenuChange} />

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="relative h-screen overflow-hidden">
          {/* Background Blur */}
          {video.poster_url && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center blur-3xl scale-110 opacity-30"
                style={{ backgroundImage: `url(${video.poster_url})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
            </>
          )}

          {/* Content */}
          <div className="container relative h-full flex items-center justify-center py-12">
            <div className="flex gap-8 items-center max-w-6xl">
              {/* Back Button - Top Left */}
              <div className="absolute top-8 left-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>

              {/* Poster */}
              {video.poster_url && (
                <img
                  src={video.poster_url}
                  alt={video.title}
                  className="w-96 h-auto rounded-2xl shadow-2xl flex-shrink-0"
                />
              )}

              {/* Info */}
              <div className="flex-1 space-y-6">
                <h1 className="text-5xl font-bold">{video.title}</h1>

                {/* Metadata */}
                <div className="flex items-center gap-6 text-lg">
                  {video.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{video.rating}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>{video.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>{video.duration}</span>
                  </div>
                </div>

                {/* Genre Tags */}
                <div className="flex flex-wrap gap-2">
                  {video.genre.split(",").map((g) => (
                    <Badge
                      key={g.trim()}
                      className="bg-green-500/20 text-green-400 hover:bg-green-500/30 px-4 py-1 text-sm"
                    >
                      {g.trim()}
                    </Badge>
                  ))}
                </div>

                {/* Director & Cast */}
                {video.director && (
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Director: </span>
                    {video.director}
                  </div>
                )}

                {video.cast && (
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Cast: </span>
                    {video.cast}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="relative">
          {/* Large Poster */}
          {video.poster_url && (
            <div className="relative">
              <img
                src={video.poster_url}
                alt={video.title}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              
              {/* Back Button Overlay */}
              <div className="absolute top-4 left-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="text-white hover:text-white hover:bg-black/50 backdrop-blur-sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="px-4 py-6 space-y-6">
            <h1 className="text-3xl font-bold">{video.title}</h1>

            {/* Metadata Row */}
            <div className="flex items-center gap-4 text-base">
              {video.rating && (
                <div className="flex items-center gap-1.5">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{video.rating}</span>
                </div>
              )}
              <span className="text-muted-foreground">•</span>
              <span>{video.year}</span>
              <span className="text-muted-foreground">•</span>
              <span>{video.duration}</span>
            </div>

            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2">
              {video.genre.split(",").map((g) => (
                <Badge
                  key={g.trim()}
                  className="bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-1"
                >
                  {g.trim()}
                </Badge>
              ))}
            </div>

            {/* Director */}
            {video.director && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Director</div>
                <div className="font-medium">{video.director}</div>
              </div>
            )}

            {/* Release Date */}
            {video.year && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Release Date</div>
                <div className="font-medium">{video.year}</div>
              </div>
            )}

            <Separator />

            {/* Review/Synopsis */}
            {video.synopsis && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Review</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {video.synopsis}
                </p>
              </div>
            )}

            <Separator />

            {/* Cast */}
            {video.cast && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Cast</h2>
                <p className="text-muted-foreground">{video.cast}</p>
                
                {cast && cast.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {cast.slice(0, 6).map((member) => (
                      <div key={member.id} className="text-center">
                        {member.image_url ? (
                          <img
                            src={member.image_url}
                            alt={member.name}
                            className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
                            <span className="text-xl">{member.name[0]}</span>
                          </div>
                        )}
                        <p className="font-medium text-xs truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.character}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Download Links */}
            {(video.telegram_link || downloadLinks && downloadLinks.length > 0) && (
              <div>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Links
                </h2>
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {video.telegram_link && (
                        <a
                          href={video.telegram_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <div className="font-medium">Option 1</div>
                            <div className="text-sm text-muted-foreground">Telegram</div>
                          </div>
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </a>
                      )}
                      {downloadLinks?.map((link, index) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <div className="font-medium">
                              Option {video.telegram_link ? index + 2 : index + 1}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {link.server} • {link.size} • {link.resolution}
                            </div>
                          </div>
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleShare}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              {video.telegram_link && (
                <Button
                  onClick={handleTelegram}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                >
                  Telegram
                </Button>
              )}
            </div>

            {/* Advertisement */}
            <Advertisement placement="video-detail" />

            {/* More Like This */}
            {relatedVideos && relatedVideos.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">More Like This</h2>
                <ScrollArea className="w-full">
                  <div className="grid grid-cols-2 gap-4">
                    {relatedVideos.map((relatedVideo) => (
                      <Link
                        key={relatedVideo.id}
                        to={`/video/${relatedVideo.id}`}
                        className="group"
                      >
                        <Card className="overflow-hidden border-0 bg-muted/30 hover:bg-muted/50 transition-colors">
                          <CardContent className="p-0">
                            {relatedVideo.poster_url && (
                              <img
                                src={relatedVideo.poster_url}
                                alt={relatedVideo.title}
                                className="w-full h-48 object-cover"
                              />
                            )}
                            <div className="p-3">
                              <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                {relatedVideo.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {relatedVideo.year}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}