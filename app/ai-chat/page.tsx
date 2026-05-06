import { AppShell } from "@/components/layout/app-shell";
import { ChatPanel } from "@/components/forms/chat-panel";

export const metadata = {
  title: "ИИ-чат",
};

export default function AiChatPage() {
  return (
    <AppShell>
      <ChatPanel />
    </AppShell>
  );
}
