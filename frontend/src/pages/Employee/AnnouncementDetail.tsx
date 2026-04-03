import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const noticeData: Record<number, { title: string; date: string; content: string[]; images?: string[] }> = {
  1: {
    title: "[공지] 설날 연휴 고객센터 운영 안내",
    date: "2025.10.20",
    content: [
      "안녕하세요. 핸디입니다.\n설날 연휴 고객센터 운영과 관련해 안내드립니다.",
      "2월 9일부터 2월 12일까지 설 연휴 기간으로\n고객센터 운영이 일시 중단될 예정입니다. 고객님의\n너그러운 양해 부탁드리며,",
      "연휴 이후 정상 운영 시 신속하게 도움을 드리겠습니다.\n감사합니다.",
    ],
    images: ["https://placehold.co/400x400", "https://placehold.co/400x400"],
  },
  2: {
    title: "[공지] 서비스 이용약관 개정 안내",
    date: "2025.10.19",
    content: ["안녕하세요. 핸디입니다.\n서비스 이용약관 개정과 관련해 안내드립니다.", "2025년 11월 1일부터 개정된 이용약관이 적용될 예정입니다."],
  },
};

const AnnouncementDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const notice = noticeData[Number(id)] || noticeData[1];
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-2 pt-4 pb-2 sticky top-0 z-10" style={{ backgroundColor: '#FFFFFF' }}>
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B' }}>공지사항</h1>
      </div>
      <div className="border-b border-border" />

      {/* Content */}
      <div className="flex-1 px-5 py-6">
        <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B', lineHeight: '1.5' }}>{notice.title}</h2>
        <p style={{ fontSize: '13px', color: '#AAB4BF', letterSpacing: '-0.02em' }} className="mt-1">{notice.date}</p>

        <div className="mt-6 space-y-4">
          {notice.content.map((para, i) => (
            <p key={i} style={{ fontSize: '15px', color: '#70737B', letterSpacing: '-0.02em', lineHeight: '1.7' }} className="whitespace-pre-line">{para}</p>
          ))}
        </div>

        {notice.images && notice.images.length > 0 && (
          <div className="flex gap-3 mt-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {notice.images.map((img, idx) => (
              <button key={idx} onClick={() => setLightboxPhoto(img)} className="flex-shrink-0">
                <img src={img} alt="" className="rounded-xl object-cover" style={{ width: '160px', height: '160px' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 이미지 확대 라이트박스 */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setLightboxPhoto(null)}>
          <button className="absolute top-4 right-4 p-2" onClick={() => setLightboxPhoto(null)}>
            <X className="h-7 w-7 text-white" />
          </button>
          <img src={lightboxPhoto} alt="" className="rounded-xl object-contain" style={{ maxWidth: '90vw', maxHeight: '85vh' }} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default AnnouncementDetail;
