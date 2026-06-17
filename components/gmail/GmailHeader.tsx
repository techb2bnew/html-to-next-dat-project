'use client'

interface Props {
  onToggleSidebar: () => void;
}

export default function GmailHeader({ onToggleSidebar }: Props) {
  return (
    <header className="flex items-center px-5 py-2 bg-white border-b border-[#f1f3f4] h-12 shrink-0 max-lg:px-[10px] max-lg:gap-[10px]">
      <div className="flex items-center w-[238px] max-lg:w-auto">
        <div className="p-3 cursor-pointer opacity-70 text-xl mr-[15px]" onClick={onToggleSidebar}>☰</div>
        <div className="text-[22px] text-[#5f6368] font-medium flex items-center gap-2 max-lg:text-lg">
          <span className="text-[#ea4335] text-2xl font-bold mr-1">M</span>
          Gmail
        </div>
      </div>
      <div className="flex-1 max-w-[720px] bg-[#f1f3f4] rounded-lg px-[15px] py-[10px] flex items-center max-lg:px-[10px] max-lg:py-[6px]">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Search mail"
          className="bg-transparent border-none outline-none w-full text-base ml-[10px] max-lg:text-sm"
        />
      </div>
      <div className="ml-auto flex items-center gap-5 opacity-70 max-lg:gap-[10px]">
        <span>❓</span>
        <span>⚙️</span>
        <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center">
          B
        </div>
      </div>
    </header>
  );
}
