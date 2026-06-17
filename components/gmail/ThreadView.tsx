'use client'
import type { EmailThread } from '@/lib/types/gmail';

interface Props {
  thread: EmailThread;
  replyBody: string;
  replyStatus: string;
  onReplyChange: (val: string) => void;
  onSendReply: () => void;
  onBack: () => void;
  onGenerateDoc: (rate: number) => void;
}

export default function ThreadView({ thread, replyBody, replyStatus, onReplyChange, onSendReply, onBack, onGenerateDoc }: Props) {
  const isTrainerThread = thread.messages.some(m => m.role === 'trainer');

  return (
    <div className="flex-1 overflow-y-auto px-[30px] py-5 bg-white max-lg:px-[15px] max-lg:py-[15px]">
      <div className="cursor-pointer mb-[15px] text-[#5f6368]" onClick={onBack}>
        ← Back
      </div>

      <div className="text-[22px] font-normal mb-[25px]">{thread.subject}</div>

      {thread.messages.map((msg, i) => {
        const isMe = msg.role === 'user';
        const isTrainer = msg.role === 'trainer';
        const avatarBg = isTrainer ? 'bg-[#0f9d58]' : !isMe ? 'bg-[#e37400]' : 'bg-[#1a73e8]';
        const initial = isTrainer ? 'T' : isMe ? 'B' : msg.senderName.charAt(0);

        return (
          <div key={i} className="mb-[30px] border-b border-[#f1f3f4] pb-5">
            <div className="flex items-center gap-[15px] mb-[15px]">
              <div className={`w-10 h-10 rounded-full ${avatarBg} text-white flex items-center justify-center text-xl shrink-0`}>
                {initial}
              </div>
              <div>
                <div className="font-bold">
                  {msg.senderName}{' '}
                  <span className="font-normal text-xs text-[#5f6368]">
                    &lt;{msg.senderEmail}&gt;
                  </span>
                </div>
                <div className="text-xs text-[#5f6368]">
                  to {isMe ? msg.recipientEmail : 'me'}
                </div>
              </div>
            </div>
            <div className="ml-[55px] whitespace-pre-wrap leading-[1.5] text-[#202124] max-lg:ml-0 max-lg:mt-[10px]" dangerouslySetInnerHTML={{ __html: msg.body }} />
          </div>
        );
      })}

      {thread.booked && (
        <div className="ml-[55px] mt-[15px]">
          <button
            onClick={() => onGenerateDoc(thread.agreedRate ?? 2500)}
            className="bg-[#0052cc] text-white border-none px-[15px] py-2 rounded cursor-pointer"
          >
            View Rate Confirmation PDF
          </button>
        </div>
      )}

      {!isTrainerThread && (
        <div className="mt-5 mb-[50px] flex items-start gap-[15px] pl-[15px]">
          <div className="w-10 h-10 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-xl shrink-0">M</div>
          <div className="flex-1 border border-[#dadce0] rounded-lg overflow-hidden shadow-[0_1px_2px_0_rgba(60,64,67,0.3)] flex flex-col bg-white">
            <textarea
              value={replyBody}
              onChange={e => onReplyChange(e.target.value)}
              placeholder="Reply..."
              className="w-full min-h-[120px] p-[15px] border-none outline-none resize-y font-inherit text-sm text-[#202124] box-border"
            />
            <div className="px-[15px] py-[10px] flex justify-between items-center">
              <div className="flex items-center gap-[15px]">
                <button
                  className="bg-[#0b57d0] text-white border-none rounded-[18px] px-6 py-[10px] font-medium cursor-pointer hover:bg-[#0842a0]"
                  onClick={onSendReply}
                >
                  Send
                </button>
                <span className="text-[#5f6368] text-base cursor-pointer font-bold font-serif" title="Formatting">A</span>
                <span className="text-[#5f6368] text-base cursor-pointer" title="Attach files">📎</span>
                <span className="text-[#5f6368] text-base cursor-pointer" title="Insert link">🔗</span>
                <span className="text-[#5f6368] text-base cursor-pointer" title="Emoji">😀</span>
              </div>
              <div className="flex items-center gap-[15px]">
                <span className="text-[#5f6368] text-xs">{replyStatus}</span>
                <span className="text-[#5f6368] text-lg cursor-pointer font-bold">⋮</span>
                <span className="text-[#5f6368] text-lg cursor-pointer">🗑️</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
