'use client'

interface Props {
  to: string;
  subject: string;
  body: string;
  onToChange: (val: string) => void;
  onSubjectChange: (val: string) => void;
  onBodyChange: (val: string) => void;
  onSend: () => void;
  onClose: () => void;
  onDraftTemplate: () => void;
}

export default function ComposeModal({ to, subject, body, onToChange, onSubjectChange, onBodyChange, onSend, onClose, onDraftTemplate }: Props) {
  return (
    <div className="fixed bottom-0 right-[80px] w-[500px] h-[500px] bg-white rounded-t-lg shadow-[0px_8px_10px_1px_rgba(0,0,0,0.14),0px_3px_14px_2px_rgba(0,0,0,0.12),0px_5px_5px_-3px_rgba(0,0,0,0.2)] flex flex-col z-[100] max-lg:w-full max-lg:h-full max-lg:right-0 max-lg:rounded-none">
      <div className="bg-[#f2f6fc] px-[15px] py-[10px] rounded-t-lg flex justify-between items-center text-sm font-medium max-lg:rounded-none">
        <span>New Message</span>
        <span className="cursor-pointer" onClick={onClose}>✖</span>
      </div>
      <div className="px-[15px] py-[10px] border-b border-[#f1f3f4]">
        <input
          type="text"
          value={to}
          onChange={e => onToChange(e.target.value)}
          placeholder="Recipients"
          className="w-full border-none outline-none text-sm"
        />
      </div>
      <div className="px-[15px] py-[10px] border-b border-[#f1f3f4]">
        <input
          type="text"
          value={subject}
          onChange={e => onSubjectChange(e.target.value)}
          placeholder="Subject"
          className="w-full border-none outline-none text-sm"
        />
      </div>
      <div className="flex-1 p-[15px] overflow-hidden">
        <textarea
          value={body}
          onChange={e => onBodyChange(e.target.value)}
          placeholder="Write your email here..."
          className="w-full h-full border-none outline-none text-sm resize-none font-[inherit]"
        />
      </div>
      <div className="px-[15px] py-3 flex items-center">
        <button
          className="bg-[#0b57d0] text-white border-none rounded-[18px] px-6 py-[10px] font-medium cursor-pointer hover:bg-[#0842a0]"
          onClick={onSend}
        >
          Send
        </button>
        <span className="ml-[15px] text-[#5f6368] cursor-pointer" onClick={onDraftTemplate}>
          Auto-Draft Negotiation
        </span>
      </div>
    </div>
  );
}
