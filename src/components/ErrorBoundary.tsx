// src/components/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트 합니다.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // 에러가 발생했을 때 보여줄 UI
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-background text-destructive">
          <h1 className="text-3xl font-bold">앗, 무언가 잘못되었어요!</h1>
          <p className="mt-4 text-muted-foreground">페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;