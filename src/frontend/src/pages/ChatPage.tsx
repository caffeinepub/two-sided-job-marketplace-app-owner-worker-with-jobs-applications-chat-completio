import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useGetJobById, useGetChatMessages, useSendMessage } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

export default function ChatPage() {
  const { jobId } = useParams({ from: '/chat/$jobId' });
  const navigate = useNavigate();
  const { identity } = useCurrentUser();
  const { data: job } = useGetJobById(BigInt(jobId));
  const { data: messages = [] } = useGetChatMessages(job ? job.id : null);
  const sendMessage = useSendMessage();

  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!job || !identity) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  const isOwner = job.ownerPrincipal.toString() === identity.getPrincipal().toString();
  const otherParty = isOwner ? job.assignedWorker : job.ownerPrincipal;

  if (!otherParty) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Chat Not Available</h2>
        <p className="text-muted-foreground mb-4">No worker assigned to this job yet</p>
        <Button onClick={() => navigate({ to: '/jobs/$jobId', params: { jobId: job.id.toString() } })}>
          Back to Job
        </Button>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) {
      return;
    }

    try {
      await sendMessage.mutateAsync({
        jobId: job.id,
        to: otherParty,
        text: messageText.trim(),
      });
      setMessageText('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/jobs/$jobId', params: { jobId: job.id.toString() } })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Job
      </Button>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-6" ref={scrollRef}>
            <div className="space-y-4 py-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.from.toString() === identity.getPrincipal().toString();
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {new Date(Number(msg.timestamp) / 1000000).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={sendMessage.isPending}
              />
              <Button type="submit" disabled={sendMessage.isPending || !messageText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
