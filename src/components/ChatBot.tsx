import { ChargerChatbot } from "@/components/ChargerChatbot";

export const ChatBot = () => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">AI 충전기 상담</h2>
        <p className="text-muted-foreground">충전기 문제를 AI와 함께 해결해보세요</p>
      </div>
      <ChargerChatbot />
    </div>
  );
};

