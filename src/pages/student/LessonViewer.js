import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Bot, CheckCircle, ChevronDown, ChevronRight,
  FileText, Loader2, PlayCircle, Send, Trophy, X,
} from "lucide-react";
import { getCourse, getCourseModules, getModuleLessons, getLessonFileUrl, askCourse } from "@/api/courses";
import { getQuiz, submitQuiz, getQuizResult, fetchQuestionImageBlob, fetchAnswerImageBlob } from "@/api/quiz";
import { markLessonComplete, getCompletedLessons } from "@/api/enrollment";

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function SidebarModule({ module, currentLessonId, completedIds, onSelect }) {
  const [open, setOpen] = useState(false);
  const [lessons, setLessons] = useState(null);

  useEffect(() => {
    getModuleLessons(module.id).then(setLessons).catch(() => setLessons([]));
  }, [module.id]);

  useEffect(() => {
    if (lessons && lessons.some((l) => l.id === currentLessonId)) setOpen(true);
  }, [lessons, currentLessonId]);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        {open ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
        <span className="text-xs font-semibold text-white/80 uppercase tracking-wide line-clamp-2 capitalize">
          {module.title}
        </span>
      </button>

      {open && (
        <div className="pb-1">
          {lessons === null ? (
            <div className="px-8 py-2 text-xs text-white/40 animate-pulse">Loading…</div>
          ) : (
            lessons.map((lesson) => {
              const active = lesson.id === currentLessonId;
              const done = completedIds.has(lesson.id);
              const Icon = lesson.content_type === "video" ? PlayCircle : FileText;
              return (
                <button
                  key={lesson.id}
                  onClick={() => onSelect(lesson)}
                  className={`w-full flex items-center gap-2.5 px-8 py-2.5 text-left transition-colors ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white/90"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs line-clamp-2 capitalize flex-1">{lesson.title}</span>
                  {done && <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Quiz viewer ─────────────────────────────────────────────────────────────

function QuizViewer({ lessonId, onComplete }) {
  const [quiz, setQuiz] = useState(null);
  const [qImages, setQImages] = useState({});
  const [aImages, setAImages] = useState({});
  const [selected, setSelected] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setQuiz(null); setResult(null); setSelected({}); setError("");
    getQuiz(lessonId)
      .then(async (q) => {
        setQuiz(q);
        // try to get a previous result
        getQuizResult(q.id).then(setResult).catch(() => {});
        // load question images
        const qImgs = {};
        const aImgs = {};
        await Promise.all(q.questions.map(async (question) => {
          if (question.image_url) {
            fetchQuestionImageBlob(question.id).then((url) => {
              setQImages((prev) => ({ ...prev, [question.id]: url }));
            }).catch(() => {});
          }
          await Promise.all(question.answers.map(async (answer) => {
            if (answer.image_url) {
              fetchAnswerImageBlob(answer.id).then((url) => {
                setAImages((prev) => ({ ...prev, [answer.id]: url }));
              }).catch(() => {});
            }
          }));
        }));
      })
      .catch(() => setError("Could not load quiz."));
  }, [lessonId]);

  async function handleSubmit() {
    const answers = Object.entries(selected).map(([question_id, answer_id]) => ({
      question_id: Number(question_id),
      answer_id: Number(answer_id),
    }));
    if (answers.length < quiz.questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await submitQuiz(quiz.id, answers);
      setResult(res);
      if (res.score >= 70) onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !quiz) return <p className="text-destructive text-sm p-6">{error}</p>;
  if (!quiz) return <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  if (result) {
    const passed = result.score >= 70;
    return (
      <div className="max-w-xl mx-auto py-12 px-6 text-center">
        <Trophy className={`w-14 h-14 mx-auto mb-4 ${passed ? "text-amber-400" : "text-muted-foreground"}`} />
        <h2 className="text-xl font-bold mb-1">{passed ? "Passed!" : "Not quite."}</h2>
        <p className="text-muted-foreground text-sm mb-6">
          You scored <span className="font-semibold text-foreground">{result.score.toFixed(0)}%</span>
          {" "}({result.correct_count}/{result.total_questions} correct)
        </p>

        {/* Per-question breakdown */}
        <div className="text-left space-y-3 mb-8">
          {result.answers.map((a, i) => (
            <div key={a.question_id} className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              a.is_correct ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}>
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Question {i + 1}: {a.is_correct ? "Correct" : "Incorrect"}</span>
            </div>
          ))}
        </div>

        {!passed && (
          <button
            onClick={() => { setResult(null); setSelected({}); }}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-6">
      <h2 className="text-lg font-bold mb-6">{quiz.title}</h2>
      <div className="space-y-8">
        {quiz.questions.map((q, qi) => (
          <div key={q.id}>
            <div className="flex gap-3 mb-3">
              <span className="text-sm font-semibold text-muted-foreground shrink-0">Q{qi + 1}.</span>
              <div>
                {q.text && <p className="text-sm font-medium text-foreground mb-2">{q.text}</p>}
                {qImages[q.id] && (
                  <img src={qImages[q.id]} alt="" className="max-h-48 rounded-lg mb-2 object-contain" />
                )}
              </div>
            </div>

            <div className="space-y-2 pl-6">
              {q.answers.map((ans) => {
                const checked = selected[q.id] === ans.id;
                return (
                  <label
                    key={ans.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={checked}
                      onChange={() => setSelected((prev) => ({ ...prev, [q.id]: ans.id }))}
                      className="accent-primary"
                    />
                    <div className="flex items-center gap-2">
                      {aImages[ans.id] && (
                        <img src={aImages[ans.id]} alt="" className="w-10 h-10 object-cover rounded" />
                      )}
                      {ans.text && <span className="text-sm">{ans.text}</span>}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-destructive text-sm mt-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-8 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        Submit Quiz
      </button>
    </div>
  );
}

// ─── File viewer (video / pdf) ────────────────────────────────────────────────

function FileViewer({ lesson, alreadyCompleted, onComplete }) {
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [justMarked, setJustMarked] = useState(false);
  const prevIdRef = useRef(null);

  useEffect(() => {
    if (prevIdRef.current === lesson.id) return;
    prevIdRef.current = lesson.id;
    setFileData(null); setError(""); setJustMarked(false); setLoading(true);
    getLessonFileUrl(lesson.id)
      .then(setFileData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [lesson.id]);

  const isCompleted = alreadyCompleted || justMarked;

  async function handleMarkComplete() {
    if (isCompleted) return;
    try {
      await markLessonComplete(lesson.id);
    } catch { /* backend may 409 if already done, that's fine */ }
    setJustMarked(true);
    onComplete();
  }

  if (loading) return (
    <div className="flex items-center justify-center flex-1">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center flex-1">
      <p className="text-muted-foreground text-sm">{error}</p>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0">
        {lesson.content_type === "video" ? (
          <video
            key={lesson.id}
            src={fileData.url}
            controls
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <iframe
            key={lesson.id}
            src={fileData.url}
            title={lesson.title}
            className="w-full h-full border-0"
          />
        )}
      </div>

      <div className="shrink-0 px-6 py-3 border-t border-border flex items-center justify-between bg-white">
        <h2 className="text-sm font-semibold text-foreground capitalize">{lesson.title}</h2>
        <button
          onClick={handleMarkComplete}
          disabled={isCompleted}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isCompleted
              ? "bg-emerald-50 text-emerald-700 cursor-default"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          {isCompleted ? "Completed" : "Mark as Complete"}
        </button>
      </div>
    </div>
  );
}

// ─── Message renderer (bold markdown) ────────────────────────────────────────

function MessageText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

// ─── AI Chat ─────────────────────────────────────────────────────────────────

function AiChat({ courseId, onClose }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! Ask me anything about this course." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const { answer } = await askCourse(courseId, q);
      setMessages((prev) => [...prev, { role: "ai", text: answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="flex flex-col h-full bg-secondary/30">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Course Assistant</p>
            <p className="text-xs text-muted-foreground">Ask anything about this course</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to lesson
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-white border border-border text-foreground rounded-bl-sm shadow-sm"
            }`}>
              <MessageText text={msg.text} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-white border border-border px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 bg-white border-t border-border px-6 py-4">
        <div className="flex gap-3 items-end bg-secondary rounded-xl px-4 py-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask a question about this course…"
            rows={1}
            className="flex-1 resize-none text-sm bg-transparent outline-none max-h-32 leading-snug"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function LessonViewer() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [allLessons, setAllLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    getCourse(courseId).then(setCourse).catch(() => {});
    getCompletedLessons(courseId).then((ids) => setCompletedIds(new Set(ids))).catch(() => {});
    getCourseModules(courseId).then(async (mods) => {
      setModules(mods);
      const lessonArrays = await Promise.all(
        mods.map((m) => getModuleLessons(m.id).catch(() => []))
      );
      const flat = lessonArrays.flat();
      setAllLessons(flat);
      if (flat.length > 0) setCurrentLesson(flat[0]);
    }).catch(() => {});
  }, [courseId]);

  function handleComplete(lessonId) {
    setCompletedIds((prev) => new Set([...prev, lessonId]));
  }

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-gray-900 flex flex-col overflow-hidden">
        {/* Back button */}
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="flex items-center gap-2 px-4 py-4 text-white/70 hover:text-white transition-colors border-b border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-medium">Back to Course</span>
        </button>

        {/* Course title */}
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-xs font-bold text-white capitalize line-clamp-2">
            {course?.title ?? "Loading…"}
          </p>
        </div>

        {/* Module / lesson list */}
        <div className="flex-1 overflow-y-auto">
          {modules.map((mod) => (
            <SidebarModule
              key={mod.id}
              module={mod}
              currentLessonId={currentLesson?.id}
              completedIds={completedIds}
              onSelect={setCurrentLesson}
            />
          ))}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {chatOpen ? (
          <AiChat courseId={courseId} onClose={() => setChatOpen(false)} />
        ) : (
          <>
            {!currentLesson ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : currentLesson.content_type === "quiz" ? (
              <div className="flex-1 overflow-y-auto">
                <QuizViewer lessonId={currentLesson.id} onComplete={() => handleComplete(currentLesson.id)} />
              </div>
            ) : (
              <FileViewer
                lesson={currentLesson}
                alreadyCompleted={completedIds.has(currentLesson.id)}
                onComplete={() => handleComplete(currentLesson.id)}
              />
            )}

            {/* Prev / Next bar */}
            {currentLesson && (
              <div className="shrink-0 border-t border-border bg-white px-4 py-3 flex items-center justify-between gap-3">
                <button
                  onClick={() => prevLesson && setCurrentLesson(prevLesson)}
                  disabled={!prevLesson}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline capitalize line-clamp-1 max-w-32">{prevLesson?.title ?? "Previous"}</span>
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{currentIndex + 1} / {allLessons.length}</span>
                  <button
                    onClick={() => setChatOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Bot className="w-4 h-4" />
                    <span className="hidden sm:inline">Ask AI</span>
                  </button>
                </div>

                <button
                  onClick={() => nextLesson && setCurrentLesson(nextLesson)}
                  disabled={!nextLesson}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline capitalize line-clamp-1 max-w-32">{nextLesson?.title ?? "Next"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
