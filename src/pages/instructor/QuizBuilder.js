import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, HelpCircle, ImagePlus, Pencil, Plus, Trash2, TrendingUp, X } from "lucide-react";
import InstructorLayout from "@/components/InstructorLayout";
import { Button } from "@/components/ui/button";
import {
  getQuiz, createQuiz, updateQuiz, deleteQuiz,
  addQuestion, updateQuestion, deleteQuestion,
  uploadQuestionImage, fetchQuestionImageBlob, deleteQuestionImage,
  addAnswer, updateAnswer, deleteAnswer,
  uploadAnswerImage, fetchAnswerImageBlob, deleteAnswerImage,
} from "@/api/quiz";
import { getQuizAnalytics } from "@/api/instructor";
import { cn } from "@/lib/utils";

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function scoreColor(value) {
  if (value >= 70) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (value >= 40) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-rose-600 bg-rose-50 border-rose-200";
}

function StatChip({ label, value, color }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border",
      color ?? "text-muted-foreground bg-secondary border-border"
    )}>
      {label}: <span className="font-bold">{value}</span>
    </span>
  );
}

export default function QuizBuilder() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const [confirmDeleteQuiz, setConfirmDeleteQuiz] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState(false);

  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestionText, setEditQuestionText] = useState("");

  const [addingAnswerInQuestion, setAddingAnswerInQuestion] = useState(null);
  const [newAnswerText, setNewAnswerText] = useState("");

  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editAnswerText, setEditAnswerText] = useState("");

  const [quizAnalytics, setQuizAnalytics] = useState(null);

  const [questionImages, setQuestionImages] = useState({});
  const [answerImages, setAnswerImages] = useState({});
  const questionImageRefs = useRef({});
  const answerImageRefs = useRef({});

  useEffect(() => {
    async function load() {
      try {
        const data = await getQuiz(Number(lessonId));
        setQuiz(data);
        getQuizAnalytics(data.id).then(setQuizAnalytics).catch(() => {});
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lessonId]);

  async function handleCreateQuiz() {
    const title = newTitle.trim().toLowerCase();
    if (!title) return;
    setCreating(true);
    try {
      const data = await createQuiz(Number(lessonId), { title });
      setQuiz(data);
      setNotFound(false);
    } catch {}
    finally { setCreating(false); }
  }

  async function handleSaveTitle() {
    const title = editTitle.trim().toLowerCase();
    if (!title) return;
    setSavingTitle(true);
    try {
      const updated = await updateQuiz(quiz.id, { title });
      setQuiz((q) => ({ ...q, title: updated.title }));
      setEditingTitle(false);
    } catch {}
    finally { setSavingTitle(false); }
  }

  async function handleDeleteQuiz() {
    setDeletingQuiz(true);
    try {
      await deleteQuiz(quiz.id);
      setQuiz(null);
      setNotFound(true);
      setConfirmDeleteQuiz(false);
      setNewTitle("");
    } catch {}
    finally { setDeletingQuiz(false); }
  }

  useEffect(() => {
    if (!quiz) return;
    async function loadImages() {
      const qImgs = {};
      const aImgs = {};
      await Promise.all(quiz.questions.map(async (q) => {
        if (q.image_url) {
          const url = await fetchQuestionImageBlob(q.id).catch(() => null);
          if (url) qImgs[q.id] = url;
        }
        await Promise.all(q.answers.map(async (a) => {
          if (a.image_url) {
            const url = await fetchAnswerImageBlob(a.id).catch(() => null);
            if (url) aImgs[a.id] = url;
          }
        }));
      }));
      setQuestionImages(qImgs);
      setAnswerImages(aImgs);
    }
    loadImages();
  }, [quiz?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUploadQuestionImage(questionId, file) {
    try {
      const updated = await uploadQuestionImage(questionId, file);
      setQuiz((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => q.id === questionId ? { ...q, image_url: updated.image_url } : q),
      }));
      setQuestionImages((prev) => ({ ...prev, [questionId]: URL.createObjectURL(file) }));
    } catch {}
  }

  async function handleDeleteQuestionImage(questionId) {
    try {
      await deleteQuestionImage(questionId);
      setQuiz((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => q.id === questionId ? { ...q, image_url: null } : q),
      }));
      setQuestionImages((prev) => { const n = { ...prev }; delete n[questionId]; return n; });
    } catch {}
  }

  async function handleUploadAnswerImage(questionId, answerId, file) {
    try {
      const updated = await uploadAnswerImage(answerId, file);
      setQuiz((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? { ...q, answers: q.answers.map((a) => a.id === answerId ? { ...a, image_url: updated.image_url } : a) }
            : q
        ),
      }));
      setAnswerImages((prev) => ({ ...prev, [answerId]: URL.createObjectURL(file) }));
    } catch {}
  }

  async function handleDeleteAnswerImage(questionId, answerId) {
    try {
      await deleteAnswerImage(answerId);
      setQuiz((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? { ...q, answers: q.answers.map((a) => a.id === answerId ? { ...a, image_url: null } : a) }
            : q
        ),
      }));
      setAnswerImages((prev) => { const n = { ...prev }; delete n[answerId]; return n; });
    } catch {}
  }

  async function handleAddQuestion() {
    try {
      const q = await addQuestion(quiz.id, { text: null });
      setQuiz((prev) => ({ ...prev, questions: [...prev.questions, q] }));
    } catch {}
  }

  async function handleSaveQuestion(questionId) {
    const text = editQuestionText.trim() || null;
    try {
      const updated = await updateQuestion(questionId, { text });
      setQuiz((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, text: updated.text } : q
        ),
      }));
      setEditingQuestionId(null);
    } catch {}
  }

  async function handleDeleteQuestion(questionId) {
    try {
      await deleteQuestion(questionId);
      setQuiz((prev) => ({
        ...prev,
        questions: prev.questions.filter((q) => q.id !== questionId),
      }));
    } catch {}
  }

  async function handleAddAnswer(questionId) {
    const text = newAnswerText.trim() || null;
    try {
      const a = await addAnswer(questionId, { text, is_correct: false });
      setQuiz((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, answers: [...q.answers, a] } : q
        ),
      }));
      setNewAnswerText("");
      setAddingAnswerInQuestion(null);
    } catch {}
  }

  async function handleSaveAnswer(questionId, answerId) {
    const text = editAnswerText.trim() || null;
    try {
      const updated = await updateAnswer(answerId, { text });
      setQuiz((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? { ...q, answers: q.answers.map((a) => a.id === answerId ? { ...a, text: updated.text } : a) }
            : q
        ),
      }));
      setEditingAnswerId(null);
    } catch {}
  }

  async function handleSetCorrect(questionId, answerId) {
    const question = quiz.questions.find((q) => q.id === questionId);
    const currentCorrect = question?.answers.find((a) => a.is_correct);
    try {
      if (currentCorrect && currentCorrect.id !== answerId) {
        await updateAnswer(currentCorrect.id, { is_correct: false });
      }
      await updateAnswer(answerId, { is_correct: true });
      setQuiz((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? { ...q, answers: q.answers.map((a) => ({ ...a, is_correct: a.id === answerId })) }
            : q
        ),
      }));
    } catch {}
  }

  async function handleDeleteAnswer(questionId, answerId) {
    try {
      await deleteAnswer(answerId);
      setQuiz((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, answers: q.answers.filter((a) => a.id !== answerId) } : q
        ),
      }));
    } catch {}
  }

  if (loading) {
    return (
      <InstructorLayout>
        <div className="p-8 max-w-3xl mx-auto space-y-4">
          <div className="h-5 w-32 bg-secondary rounded animate-pulse" />
          <div className="h-40 bg-secondary rounded-xl animate-pulse" />
          <div className="h-40 bg-secondary rounded-xl animate-pulse" />
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="p-8 max-w-3xl mx-auto space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate(`/instructor/courses/${courseId}`)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Manage Course
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <HelpCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Quiz Builder</h1>
            <p className="text-sm text-muted-foreground">Build questions and answer choices for this quiz lesson.</p>
          </div>
        </div>

        {/* No quiz yet */}
        {notFound ? (
          <div className="bg-white rounded-xl border border-border p-10 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">No quiz created for this lesson yet.</p>
            <div className="flex gap-2 w-full max-w-sm">
              <input
                autoFocus
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Quiz title"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateQuiz(); }}
              />
              <Button size="sm" onClick={handleCreateQuiz} disabled={creating || !newTitle.trim()}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Quiz title card */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {editingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm font-semibold rounded-lg border border-primary bg-primary/5 focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveTitle();
                          if (e.key === "Escape") setEditingTitle(false);
                        }}
                      />
                      <button
                        onClick={handleSaveTitle}
                        disabled={savingTitle}
                        className="text-primary hover:text-primary/70 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingTitle(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <span className="font-semibold text-foreground">{capitalize(quiz.title)}</span>
                      <button
                        onClick={() => { setEditingTitle(true); setEditTitle(quiz.title); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}
                  </p>

                  {quizAnalytics && (
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      <TrendingUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <StatChip label="Attempts" value={quizAnalytics.total_attempts} />
                      <StatChip
                        label="Avg Score"
                        value={`${quizAnalytics.average_score}%`}
                        color={scoreColor(quizAnalytics.average_score)}
                      />
                      <StatChip
                        label="Pass Rate"
                        value={`${quizAnalytics.pass_rate}%`}
                        color={scoreColor(quizAnalytics.pass_rate)}
                      />
                    </div>
                  )}
                </div>

                {/* Delete quiz */}
                {confirmDeleteQuiz ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">Delete entire quiz?</span>
                    <Button size="sm" variant="destructive" onClick={handleDeleteQuiz} disabled={deletingQuiz}>
                      {deletingQuiz ? "Deleting..." : "Yes, delete"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmDeleteQuiz(false)}>Cancel</Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteQuiz(true)}
                    className="shrink-0 text-muted-foreground hover:text-destructive p-1.5 rounded hover:bg-destructive/5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {quiz.questions.map((question, qi) => (
                <div key={question.id} className="bg-white rounded-xl border border-border overflow-hidden">

                  {/* Question header */}
                  <div className="flex items-start gap-3 p-5 border-b border-border/60">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                      {qi + 1}
                    </span>

                    <div className="flex-1 min-w-0 space-y-2">
                      {editingQuestionId === question.id ? (
                        <div className="flex items-start gap-2">
                          <textarea
                            autoFocus
                            value={editQuestionText}
                            onChange={(e) => setEditQuestionText(e.target.value)}
                            placeholder="Question text"
                            rows={3}
                            className="flex-1 px-2 py-1 text-sm rounded border border-primary bg-primary/5 focus:outline-none resize-none"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.ctrlKey) handleSaveQuestion(question.id);
                              if (e.key === "Escape") setEditingQuestionId(null);
                            }}
                          />
                          <button onClick={() => handleSaveQuestion(question.id)} className="text-primary hover:text-primary/70 shrink-0">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingQuestionId(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group/q">
                          <span className={cn(
                            "text-sm font-medium",
                            question.text ? "text-foreground" : "text-muted-foreground italic"
                          )}>
                            {question.text ? capitalize(question.text) : "Click to add question text"}
                          </span>
                          <button
                            onClick={() => { setEditingQuestionId(question.id); setEditQuestionText(question.text ?? ""); }}
                            className="opacity-0 group-hover/q:opacity-100 transition-opacity text-muted-foreground hover:text-primary shrink-0"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Question image */}
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => { if (el) questionImageRefs.current[question.id] = el; }}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleUploadQuestionImage(question.id, file);
                          e.target.value = "";
                        }}
                      />
                      {questionImages[question.id] ? (
                        <div className="relative group/qimg inline-block">
                          <img
                            src={questionImages[question.id]}
                            alt=""
                            className="max-h-52 max-w-full rounded-lg border border-border object-contain"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/qimg:bg-black/40 transition-colors rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover/qimg:opacity-100">
                            <button
                              onClick={() => questionImageRefs.current[question.id]?.click()}
                              className="bg-white text-foreground text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-secondary transition-colors"
                            >
                              Change
                            </button>
                            <button
                              onClick={() => handleDeleteQuestionImage(question.id)}
                              className="bg-white text-destructive text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-secondary transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => questionImageRefs.current[question.id]?.click()}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary px-2 py-1 rounded border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                        >
                          <ImagePlus className="w-3.5 h-3.5" />
                          Add photo
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Answers */}
                  <div className="divide-y divide-border/40">
                    {question.answers.map((answer) => (
                      <div
                        key={answer.id}
                        className="flex items-center gap-3 px-5 py-3 group/ans hover:bg-secondary/20 transition-colors"
                      >
                        {/* Correct radio */}
                        <button
                          onClick={() => handleSetCorrect(question.id, answer.id)}
                          className={cn(
                            "shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                            answer.is_correct
                              ? "border-primary bg-primary"
                              : "border-border hover:border-primary/60"
                          )}
                        >
                          {answer.is_correct && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </button>

                        {/* Answer text */}
                        {editingAnswerId === answer.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              autoFocus
                              type="text"
                              value={editAnswerText}
                              onChange={(e) => setEditAnswerText(e.target.value)}
                              placeholder="Answer text"
                              className="flex-1 px-2 py-0.5 text-sm rounded border border-primary bg-primary/5 focus:outline-none"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveAnswer(question.id, answer.id);
                                if (e.key === "Escape") setEditingAnswerId(null);
                              }}
                            />
                            <button onClick={() => handleSaveAnswer(question.id, answer.id)} className="text-primary hover:text-primary/70 shrink-0">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingAnswerId(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-1 group/at min-w-0">
                            <span className={cn(
                              "text-sm truncate",
                              answer.text ? "text-foreground" : "text-muted-foreground italic"
                            )}>
                              {answer.text ? capitalize(answer.text) : "Click to add answer text"}
                            </span>
                            <button
                              onClick={() => { setEditingAnswerId(answer.id); setEditAnswerText(answer.text ?? ""); }}
                              className="opacity-0 group-hover/at:opacity-100 transition-opacity text-muted-foreground hover:text-primary shrink-0"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Answer image */}
                        <input
                          type="file"
                          accept="image/*"
                          ref={(el) => { if (el) answerImageRefs.current[answer.id] = el; }}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleUploadAnswerImage(question.id, answer.id, file);
                            e.target.value = "";
                          }}
                        />
                        {answerImages[answer.id] ? (
                          <div className="relative group/aimg shrink-0">
                            <img
                              src={answerImages[answer.id]}
                              alt=""
                              className="w-10 h-10 rounded border border-border object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/aimg:bg-black/50 transition-colors rounded flex items-center justify-center gap-1 opacity-0 group-hover/aimg:opacity-100">
                              <button
                                onClick={() => answerImageRefs.current[answer.id]?.click()}
                                className="text-white"
                                title="Change"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteAnswerImage(question.id, answer.id)}
                                className="text-white"
                                title="Remove"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => answerImageRefs.current[answer.id]?.click()}
                            className="opacity-0 group-hover/ans:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-primary p-1 rounded hover:bg-primary/5 transition-colors"
                            title="Add image"
                          >
                            <ImagePlus className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {answer.is_correct && (
                          <span className="shrink-0 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                            Correct
                          </span>
                        )}

                        <button
                          onClick={() => handleDeleteAnswer(question.id, answer.id)}
                          className="opacity-0 group-hover/ans:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Add answer */}
                    {addingAnswerInQuestion === question.id ? (
                      <div className="flex items-center gap-2 px-5 py-3">
                        <div className="shrink-0 w-4 h-4 rounded-full border-2 border-border" />
                        <input
                          autoFocus
                          type="text"
                          value={newAnswerText}
                          onChange={(e) => setNewAnswerText(e.target.value)}
                          placeholder="Answer text"
                          className="flex-1 px-2 py-0.5 text-sm rounded border border-border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddAnswer(question.id);
                            if (e.key === "Escape") { setAddingAnswerInQuestion(null); setNewAnswerText(""); }
                          }}
                        />
                        <Button size="sm" onClick={() => handleAddAnswer(question.id)}>Add</Button>
                        <Button size="sm" variant="outline" onClick={() => { setAddingAnswerInQuestion(null); setNewAnswerText(""); }}>
                          Cancel
                        </Button>
                      </div>
                    ) : question.answers.length < 4 ? (
                      <button
                        onClick={() => { setAddingAnswerInQuestion(question.id); setNewAnswerText(""); }}
                        className="w-full flex items-center gap-2 px-5 py-2.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Answer
                        <span className="ml-auto text-muted-foreground/50">{question.answers.length}/4</span>
                      </button>
                    ) : (
                      <div className="px-5 py-2.5 text-xs text-muted-foreground/50 text-right">4/4 answers</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add question */}
            <button
              onClick={handleAddQuestion}
              className="w-full flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground hover:text-primary border-2 border-dashed border-border hover:border-primary/40 rounded-xl hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </>
        )}
      </div>
    </InstructorLayout>
  );
}
