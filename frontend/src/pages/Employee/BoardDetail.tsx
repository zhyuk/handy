import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, MessageSquare, MoreVertical, Send, CornerDownRight, Pencil, Trash2, MessageCircle, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import ConfirmDialogComp from "@/components/ui/ConfirmDialog";

interface Comment {
  id: number;
  author: string;
  role: string;
  time: string;
  content: string;
  isMyComment: boolean;
  replies?: Comment[];
}

const CURRENT_USER = "정수민"; // 현재 로그인 사용자

const dummyPosts: Record<number, {
  id: number; category: string; author: string; role: string;
  date: string; title: string; content: string; photos: string[];
  comments: number;
}> = {
  1: { id: 1, category: "공지사항", author: "사장님", role: "사장님", date: "2025.10.20", title: "마감 시 주의사항", content: "1. 요즘 날씨가 많이 추워져서 퇴근 시에 싱크대 수도 아주 약하게 틀어주세요. (배관 어는 거 방지)\n2. 마감 후 뒷문 잠금 꼭 확인해주세요.", photos: [], comments: 3 },
  2: { id: 2, category: "공지사항", author: "사장님", role: "사장님", date: "2025.10.19", title: "겨울시즌 신메뉴 레시피", content: "겨울 딸기시즌 신메뉴 레시피 공지합니다.\n베이스 및 토핑들 위치도 참고해주세요.", photos: ["https://picsum.photos/300/400?random=1", "https://picsum.photos/300/400?random=2"], comments: 3 },
  3: { id: 3, category: "비품관리", author: "정수민", role: "알바생", date: "1시간 전", title: "발주 필요 물품", content: "곡물파우더 (반봉지 남음)\n감자빵 (2개 남음)\n컵홀더 (거의 없음)", photos: [], comments: 0 },
  4: { id: 4, category: "대타요청", author: "정수민", role: "알바생", date: "1시간 전", title: "대타 구해요", content: "11월 06일 10:00~18:00 대타 가능하신 분 있나요?", photos: [], comments: 3 },
  5: { id: 5, category: "대타요청", author: "정수민", role: "알바생", date: "1시간 전", title: "대타 구해요", content: "11월 06일 10:00~18:00 대타 가능하신 분 있나요?", photos: [], comments: 0 },
};

const dummyComments: Comment[] = [
  { id: 1, author: "김정만", role: "알바생", time: "1분 전", content: "확인했습니다.", isMyComment: false, replies: [{ id: 10, author: CURRENT_USER, role: "알바생", time: "1분 전", content: "파이팅해봅시다.", isMyComment: true }] },
  { id: 2, author: "김정식", role: "알바생", time: "8분 전", content: "확인했습니다.", isMyComment: false },
  { id: 3, author: CURRENT_USER, role: "알바생", time: "20분 전", content: "확인했습니다.", isMyComment: true },
];

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  "공지사항": { bg: '#E8F3FF', color: '#4261FF' },
  "건의사항": { bg: '#ECFFF1', color: '#1EDC83' },
  "비품관리": { bg: '#FDF9DF', color: '#FFB300' },
  "대타요청": { bg: '#FFEAE6', color: '#FF3D3D' },
  "일반 게시글": { bg: '#F7F7F8', color: '#AAB4BF' },
};

function PopoverMenu({ open, onClose, children, anchorRef }: { open: boolean; onClose: () => void; children: React.ReactNode; anchorRef: React.RefObject<HTMLButtonElement> }) {
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && anchorRef.current && !anchorRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, anchorRef]);
  if (!open) return null;
  return (
    <div ref={menuRef} className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-border z-50 overflow-hidden" style={{ minWidth: '140px', boxShadow: '2px 2px 12px rgba(0,0,0,0.12)' }}>
      {children}
    </div>
  );
}

export default function BoardDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const postId = Number(id) || 1;
  const post = dummyPosts[postId] || dummyPosts[1];
  const isMyPost = post.author === CURRENT_USER;
  const catStyle = CATEGORY_COLORS[post.category] || { bg: '#F7F7F8', color: '#AAB4BF' };

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(dummyComments);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const postMenuRef = useRef<HTMLButtonElement>(null!);
  const [deletePostDialog, setDeletePostDialog] = useState(false);
  const [commentMenuId, setCommentMenuId] = useState<number | null>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [deleteCommentDialog, setDeleteCommentDialog] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = { id: Date.now(), author: CURRENT_USER, role: "알바생", time: "방금", content: commentText.trim(), isMyComment: true };
    if (replyTo) {
      setComments(comments.map(c => c.id === replyTo.id ? { ...c, replies: [...(c.replies || []), newComment] } : c));
      setReplyTo(null);
    } else {
      setComments([newComment, ...comments]);
    }
    setCommentText("");
  };

  const handleDeletePost = () => { setDeletePostDialog(false); toast("게시글이 삭제되었어요"); navigate(-1); };
  const handleDeleteComment = () => {
    if (!selectedComment) return;
    setComments(prev => prev.filter(c => c.id !== selectedComment.id).map(c => ({ ...c, replies: c.replies?.filter(r => r.id !== selectedComment.id) })));
    setDeleteCommentDialog(false); setSelectedComment(null); toast("댓글이 삭제되었어요");
  };



  return (
    <div className="min-h-screen max-w-lg mx-auto flex flex-col" style={{ backgroundColor: '#F7F7F8' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-2 px-2 pt-4 pb-2" style={{ backgroundColor: '#FFFFFF' }}>
        <button onClick={() => navigate(-1)} className="p-1"><ChevronLeft className="h-6 w-6 text-foreground" /></button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B' }}>게시판</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* 게시글 본문 */}
        <div className="mx-4 mt-4 mb-3 rounded-2xl bg-white p-4" style={{ boxShadow: '2px 2px 12px rgba(0,0,0,0.06)' }}>
          <span className="inline-block rounded-md px-2 py-0.5 mb-4" style={{ fontSize: '12px', fontWeight: 500, backgroundColor: catStyle.bg, color: catStyle.color }}>{post.category}</span>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-full bg-muted" style={{ width: '44px', height: '44px', fontSize: '20px' }}>👤</div>
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em', color: '#19191B' }}>{post.author}</span>
                  <span className="rounded-full px-2 py-0.5" style={{ fontSize: '11px', backgroundColor: '#F7F7F8', color: '#70737B' }}>{post.role}</span>
                </div>
                <span style={{ fontSize: '12px', color: '#AAB4BF' }}>{post.date}</span>
              </div>
            </div>
            {isMyPost && (
              <div className="relative">
                <button ref={postMenuRef} onClick={() => setShowPostMenu(!showPostMenu)} className="p-1">
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </button>
                <PopoverMenu open={showPostMenu} onClose={() => setShowPostMenu(false)} anchorRef={postMenuRef}>
                  <button onClick={() => { setShowPostMenu(false); navigate("/board/write", { state: { edit: true, post } }); }}
                    className="flex items-center justify-between w-full px-4 py-3 border-b border-border" style={{ fontSize: '14px', color: '#19191B' }}>
                    <span>수정하기</span><Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => { setShowPostMenu(false); setDeletePostDialog(true); }}
                    className="flex items-center justify-between w-full px-4 py-3" style={{ fontSize: '14px', color: '#19191B' }}>
                    <span>삭제하기</span><Trash2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </PopoverMenu>
              </div>
            )}
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B', marginBottom: '12px' }}>{post.title}</h2>
          <p className="whitespace-pre-line mb-4" style={{ fontSize: '14px', color: '#70737B', lineHeight: '1.6', letterSpacing: '-0.02em' }}>{post.content}</p>

          {post.photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto mb-4" style={{ scrollbarWidth: 'none' }}>
              {post.photos.map((photo, idx) => (
                <img key={idx} src={photo} alt="" className="flex-shrink-0 rounded-xl object-cover cursor-pointer"
                  style={{ width: '180px', height: '220px' }}
                  onClick={() => setLightboxPhoto(photo)} />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4" style={{ color: '#AAB4BF' }}>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span style={{ fontSize: '13px' }}>{post.comments}</span>
            </div>
          </div>
        </div>

        {/* 댓글 */}
        <div className="mx-4 rounded-2xl bg-white p-4" style={{ boxShadow: '2px 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em', color: '#19191B', marginBottom: '16px' }}>댓글 {comments.length}</p>
          {comments.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <span style={{ fontSize: '14px', color: '#AAB4BF' }}>등록된 댓글이 없어요.</span>
            </div>
          ) : (
            <div className="space-y-1">
              {comments.map((comment) => (
                <div key={comment.id}>
                  <CommentItem comment={comment} menuOpen={commentMenuId === comment.id}
                    onToggleMenu={() => setCommentMenuId(commentMenuId === comment.id ? null : comment.id)}
                    onCloseMenu={() => setCommentMenuId(null)}
                    onReply={() => { setCommentMenuId(null); setReplyTo(comment); }}
                    onDelete={() => { setCommentMenuId(null); setSelectedComment(comment); setDeleteCommentDialog(true); }} />
                  {comment.replies?.map((reply) => (
                    <div key={reply.id} className="pl-6">
                      <div className="flex items-start gap-2">
                        <CornerDownRight className="h-4 w-4 text-muted-foreground mt-3 flex-shrink-0" />
                        <div className="flex-1">
                          <CommentItem comment={reply} menuOpen={commentMenuId === reply.id}
                            onToggleMenu={() => setCommentMenuId(commentMenuId === reply.id ? null : reply.id)}
                            onCloseMenu={() => setCommentMenuId(null)}
                            onDelete={() => { setCommentMenuId(null); setSelectedComment(reply); setDeleteCommentDialog(true); }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 댓글 입력 */}
      <div className="sticky bottom-0 border-t border-border px-5 py-3" style={{ backgroundColor: '#FFFFFF' }}>
        {replyTo && (
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: '13px', color: '#4261FF', fontWeight: 500 }}>{replyTo.author}님에게 답글 작성 중</span>
            <button onClick={() => setReplyTo(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input type="text" placeholder={replyTo ? "답글 입력하기" : "댓글 입력하기"}
            value={commentText} onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            className="flex-1 rounded-xl border border-border bg-white px-4 focus:outline-none focus:border-primary"
            style={{ height: '44px', fontSize: '14px', color: '#19191B', letterSpacing: '-0.02em' }} />
          <button onClick={handleSendComment} className="flex items-center justify-center" style={{ width: '44px', height: '44px' }}>
            <Send className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* 다이얼로그 */}
      <ConfirmDialogComp open={deletePostDialog} onOpenChange={setDeletePostDialog} title="게시글 삭제"
        description={<>해당 게시글을 삭제하시겠어요?<br />삭제 시 복구가 불가해요</>}
        buttons={[{ label: "취소", onClick: () => setDeletePostDialog(false), variant: "cancel" }, { label: "삭제하기", onClick: handleDeletePost }]} />
      <ConfirmDialogComp open={deleteCommentDialog} onOpenChange={setDeleteCommentDialog} title="댓글 삭제"
        description="해당 댓글을 삭제하시겠어요?"
        buttons={[{ label: "취소", onClick: () => setDeleteCommentDialog(false), variant: "cancel" }, { label: "삭제하기", onClick: handleDeleteComment }]} />

      {/* 이미지 확대 라이트박스 */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setLightboxPhoto(null)}>
          <button className="absolute top-4 right-4 p-2" onClick={() => setLightboxPhoto(null)}>
            <X className="h-7 w-7 text-white" />
          </button>
          <img src={lightboxPhoto} alt="" className="max-w-full max-h-full rounded-xl object-contain" style={{ maxWidth: '90vw', maxHeight: '85vh' }} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, menuOpen, onToggleMenu, onCloseMenu, onReply, onDelete }: {
  comment: Comment; menuOpen: boolean; onToggleMenu: () => void; onCloseMenu: () => void; onReply?: () => void; onDelete: () => void;
}) {
  const moreRef = useRef<HTMLButtonElement>(null!);
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex items-center justify-center rounded-full bg-muted flex-shrink-0" style={{ width: '40px', height: '40px', fontSize: '18px' }}>👤</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.02em', color: '#19191B' }}>{comment.author}</span>
            <span className="rounded-full px-2 py-0.5" style={{ fontSize: '11px', backgroundColor: '#E8F3FF', color: '#4261FF' }}>{comment.role}</span>
          </div>
          <div className="flex items-center gap-1.5 relative">
            <span style={{ fontSize: '12px', color: '#AAB4BF' }}>{comment.time}</span>
            <button ref={moreRef} onClick={onToggleMenu}><MoreVertical className="h-4 w-4 text-muted-foreground" /></button>
            <PopoverMenu open={menuOpen} onClose={onCloseMenu} anchorRef={moreRef}>
              {onReply && (
                <button onClick={onReply} className="flex items-center justify-between w-full px-4 py-3 border-b border-border" style={{ fontSize: '14px', color: '#19191B' }}>
                  <span>답글달기</span><MessageCircle className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              {comment.isMyComment && (
                <button onClick={onDelete} className="flex items-center justify-between w-full px-4 py-3" style={{ fontSize: '14px', color: '#19191B' }}>
                  <span>삭제하기</span><Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </PopoverMenu>
          </div>
        </div>
        <p className="mt-1 cursor-pointer" style={{ fontSize: '14px', color: '#70737B', letterSpacing: '-0.02em' }} onClick={() => onReply?.()}>{comment.content}</p>
      </div>
    </div>
  );
}
