'use client'
import type { EmailThread, FolderType } from '@/lib/types/gmail';

interface Props {
  emails: EmailThread[];
  currentFolder: FolderType;
  onOpenThread: (index: number) => void;
}

export default function EmailList({ emails, currentFolder, onOpenThread }: Props) {
  const filtered: { thread: EmailThread; index: number }[] = [];
  emails.forEach((thread, index) => {
    const hasBroker = thread.messages.some(m => m.role !== 'user');
    const hasUser = thread.messages.some(m => m.role === 'user');
    if (currentFolder === 'inbox' && hasBroker) filtered.push({ thread, index });
    if (currentFolder === 'sent' && hasUser) filtered.push({ thread, index });
  });

  const items = [...filtered].reverse();

  if (items.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="text-center p-[50px] text-[#5f6368]">
          Your {currentFolder} is empty.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {items.map(({ thread, index }) => {
        const lastMsg = thread.messages[thread.messages.length - 1];
        const isUnread = !thread.read && currentFolder === 'inbox';

        let displaySender = lastMsg.senderName;
        let previewBody = lastMsg.body;

        if (currentFolder === 'sent') {
          const brokerMsg = thread.messages.find(m => m.role !== 'user');
          displaySender = 'To: ' + (brokerMsg?.senderName || thread.messages[0].recipientEmail);
          const sentMsg = thread.messages.slice().reverse().find(m => m.role === 'user') || lastMsg;
          previewBody = sentMsg.body;
        }

        return (
          <div
            key={index}
            className={`flex px-[15px] py-[10px] border-b border-[#f1f3f4] cursor-pointer items-center text-sm text-[#202124] hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:relative hover:z-[1] max-lg:flex-col max-lg:items-start max-lg:gap-1 max-lg:px-[15px] max-lg:py-3 ${isUnread ? 'font-bold bg-white' : 'bg-[#f2f6fc]'}`}
            onClick={() => onOpenThread(index)}
          >
            <div className="w-[200px] max-lg:w-full max-lg:font-bold">{displaySender}</div>
            <div className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis max-lg:flex-none max-lg:w-full max-lg:whitespace-normal max-lg:line-clamp-2">
              <strong>{thread.subject}</strong>
              {' - '}
              <span className="text-[#5f6368] font-normal">
                {previewBody.substring(0, 80).replace(/\n/g, ' ')}...
              </span>
            </div>
            <div className="w-20 text-right text-[#5f6368] text-xs max-lg:w-auto max-lg:self-end max-lg:text-[11px] max-lg:mt-1">Just now</div>
          </div>
        );
      })}
    </div>
  );
}
