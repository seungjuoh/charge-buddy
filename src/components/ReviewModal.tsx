import { useState } from "react";
import { Star, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChargingStation, Review } from "@/types/station";
import { useToast } from "@/hooks/use-toast";

interface ReviewModalProps {
  station: ChargingStation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReviewModal = ({ station, open, onOpenChange }: ReviewModalProps) => {
  const [newReview, setNewReview] = useState({ rating: 0, comment: "", authorName: "" });
  const [showWriteForm, setShowWriteForm] = useState(false);
  const { toast } = useToast();

  const handleSubmitReview = () => {
    if (!newReview.authorName.trim() || !newReview.comment.trim() || newReview.rating === 0) {
      toast({
        title: "모든 필드를 입력해주세요",
        description: "작성자명, 평점, 후기 내용이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    // Mock API call - in real app would POST to /reviews
    toast({
      title: "후기가 등록되었습니다",
      description: "소중한 후기를 남겨주셔서 감사합니다!",
    });

    setNewReview({ rating: 0, comment: "", authorName: "" });
    setShowWriteForm(false);
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{station.name} 후기</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 후기 작성 버튼 */}
          {!showWriteForm && (
            <Button 
              onClick={() => setShowWriteForm(true)}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              후기 작성하기
            </Button>
          )}

          {/* 후기 작성 폼 */}
          {showWriteForm && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-4">
              <div className="space-y-2">
                <Label htmlFor="authorName">작성자명</Label>
                <Input
                  id="authorName"
                  placeholder="닉네임을 입력하세요"
                  value={newReview.authorName}
                  onChange={(e) => setNewReview({...newReview, authorName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>평점</Label>
                {renderStars(newReview.rating, true, (rating) => setNewReview({...newReview, rating}))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">후기 내용</Label>
                <Textarea
                  id="comment"
                  placeholder="충전소 이용 경험을 공유해주세요..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmitReview} className="flex-1">
                  후기 등록
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowWriteForm(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* 기존 후기 목록 */}
          <div className="space-y-3">
            <h3 className="font-semibold">
              기존 후기 ({station.reviews?.length || 0}개)
            </h3>
            
            {station.reviews && station.reviews.length > 0 ? (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {station.reviews.map((review) => (
                    <div key={review.id} className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{review.authorName}</span>
                            <span className="text-xs text-muted-foreground">{review.createdAt}</span>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>아직 등록된 후기가 없습니다.</p>
                <p className="text-sm">첫 번째 후기를 남겨보세요!</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};