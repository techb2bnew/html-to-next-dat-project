'use client'
import type { FolderType } from '@/lib/types/gmail';

interface Props {
  open: boolean;
  currentFolder: FolderType;
  unreadCount: number;
  onShowFolder: (folder: FolderType) => void;
  onOpenCompose: () => void;
}

export default function GmailSidebar({ open, currentFolder, unreadCount, onShowFolder, onOpenCompose }: Props) {
  return (
    <div className={`w-64 px-[10px] py-[15px] bg-white shrink-0 max-lg:fixed max-lg:top-[65px] max-lg:bottom-0 max-lg:z-[99] max-lg:shadow-[2px_0_10px_rgba(0,0,0,0.1)] max-lg:w-[250px] max-lg:transition-[left] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.4,0,0.2,1)] ${open ? 'max-lg:left-0' : 'max-lg:-left-[270px]'}`}>
      <button
        className="bg-[#c2e7ff] text-[#001d35] border-none rounded-2xl px-6 py-[15px] text-[15px] font-medium cursor-pointer flex items-center gap-3 mb-[15px] hover:bg-[#b3d7f0] hover:shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        onClick={onOpenCompose}
      >
        <span className="text-xl">✎</span> Compose
      </button>

      <div
        className={`flex items-center px-[15px] py-[10px] mr-[15px] rounded-r-2xl cursor-pointer text-sm ${currentFolder === 'inbox' ? 'bg-[#fce8e6] text-[#d93025] font-bold' : 'text-[#202124] hover:bg-[#f1f3f4]'}`}
        onClick={() => onShowFolder('inbox')}
      >
        <span className="mr-[15px]">📥</span>
        Inbox
        <span className="ml-auto font-bold">{unreadCount > 0 ? unreadCount : ''}</span>
      </div>

      <div className="flex items-center px-[15px] py-[10px] mr-[15px] rounded-r-2xl cursor-pointer text-sm text-[#202124] hover:bg-[#f1f3f4]">
        <span className="mr-[15px]">⭐</span> Starred
      </div>
      <div className="flex items-center px-[15px] py-[10px] mr-[15px] rounded-r-2xl cursor-pointer text-sm text-[#202124] hover:bg-[#f1f3f4]">
        <span className="mr-[15px]">🕒</span> Snoozed
      </div>

      <div
        className={`flex items-center px-[15px] py-[10px] mr-[15px] rounded-r-2xl cursor-pointer text-sm ${currentFolder === 'sent' ? 'bg-[#fce8e6] text-[#d93025] font-bold' : 'text-[#202124] hover:bg-[#f1f3f4]'}`}
        onClick={() => onShowFolder('sent')}
      >
        <span className="mr-[15px]">🚀</span> Sent
      </div>
    </div>
  );
}
