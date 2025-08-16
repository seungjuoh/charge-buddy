
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, MessageCircle, Camera, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  extractedText: string;
  solution: string;
}

export const ChargerChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "파일 크기 오류",
          description: "이미지 파일 크기는 10MB 이하여야 합니다.",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      setResult(null);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      // Step 1: OCR - Extract text from image
      const ocrFormData = new FormData();
      ocrFormData.append('document', selectedImage);
      ocrFormData.append('model', 'ocr');

      const ocrResponse = await fetch('https://api.upstage.ai/v1/document-digitization', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer up_4RHT7fYWAXqFsrDFjXkFVD1HbaH6Z',
        },
        body: ocrFormData,
      });

      const ocrResult = await ocrResponse.json();
      const extractedText = ocrResult.text || '';

      // Step 2: AI Analysis using Solar Pro2
      const aiResponse = await fetch('https://api.upstage.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer up_4RHT7fYWAXqFsrDFjXkFVD1HbaH6Z',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'solar-pro2',
          messages: [
            {
              role: 'user',
              content: `You are an AI assistant that helps users solve electric vehicle (EV) charger issues. 
The following text was extracted from a photo of an EV charger error or manual:

"""${extractedText}"""

Identify the issue, summarize it, and suggest an actionable solution in Korean.
If possible, include the specific cause (if mentioned) and suggest the next steps.
Format your response in a clear, user-friendly way with:
1. 오류 요약 (Error Summary)
2. 원인 분석 (Cause Analysis) 
3. 해결 방법 (Solution Steps)
4. 추가 조치 (Additional Actions if needed)`
            }
          ],
          stream: false
        }),
      });

      const aiResult = await aiResponse.json();
      const solution = aiResult.choices?.[0]?.message?.content || '분석 결과를 가져올 수 없습니다.';

      setResult({
        extractedText,
        solution,
      });
      
      toast({
        title: "분석 완료",
        description: "충전기 오류를 분석했습니다.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "분석 실패",
        description: "이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              충전기 오류 해결 도우미
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!selectedImage && !result && (
              <Card className="border-dashed border-2 border-border">
                <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">충전기 오류 화면 사진을 업로드하세요</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG 파일 (최대 10MB)
                    </p>
                  </div>
                  <Button variant="outline" onClick={triggerFileInput} className="cursor-pointer">
                    <Camera className="h-4 w-4 mr-2" />
                    사진 선택
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    style={{ display: 'none' }}
                  />
                </CardContent>
              </Card>
            )}

            {selectedImage && !result && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">선택된 이미지</CardTitle>
                    <Button variant="ghost" size="sm" onClick={reset}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {selectedImage.name}
                  </div>
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected charging error"
                    className="w-full rounded-md max-h-48 object-contain bg-muted"
                  />
                  <Button 
                    onClick={analyzeImage} 
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        오류 분석 중...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        오류 분석하기
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">분석 결과</h3>
                  <Button variant="ghost" size="sm" onClick={reset}>
                    <X className="h-4 w-4 mr-2" />
                    새로운 분석
                  </Button>
                </div>

                {result.extractedText && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">추출된 텍스트</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {result.extractedText}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">해결 방법</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm font-sans">
                        {result.solution}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
