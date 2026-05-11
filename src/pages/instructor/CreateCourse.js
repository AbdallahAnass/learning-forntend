import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X, Plus } from "lucide-react";
import InstructorLayout from "@/components/InstructorLayout";
import { Button } from "@/components/ui/button";
import { createCourse, uploadThumbnail } from "@/api/instructor";

export default function CreateCourse() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState([]);
  const skillInputRef = useRef();
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdCourseId, setCreatedCourseId] = useState(null);

  const fileRef = useRef();

  function handleThumbnailChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  function removeThumbnail() {
    setThumbnail(null);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(null);
    fileRef.current.value = "";
  }

  function addSkill() {
    const val = skillInputRef.current?.value.trim().toLowerCase() ?? "";
    if (!val || skills.includes(val)) return;
    setSkills((prev) => [...prev, val]);
    skillInputRef.current.value = "";
  }

  function handleSkillKeyDown(e) {
    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
  }

  function removeSkill(skill) {
    setSkills(skills.filter((s) => s !== skill));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // If course was already created (thumbnail upload failed on a prior attempt),
      // skip creation and only retry the thumbnail upload.
      let courseId = createdCourseId;
      if (!courseId) {
        const course = await createCourse({
          title: title.trim().toLowerCase(),
          description: description.trim().toLowerCase(),
          skills: skills.length > 0 ? skills : undefined,
        });
        courseId = course.id;
        setCreatedCourseId(courseId);
      }

      if (thumbnail) {
        await uploadThumbnail(courseId, thumbnail);
      }

      navigate(`/instructor/courses/${courseId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const titleOk = title.trim().length >= 1 && title.trim().length <= 60;
  const descOk = description.trim().length >= 1 && description.trim().length <= 250;
  const canSubmit = titleOk && descOk && !submitting;

  return (
    <InstructorLayout>
      <div className="p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Create Course</h1>
          <p className="text-muted-foreground text-sm mt-1">Fill in the details to create a new course</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thumbnail */}
          <div className="bg-white rounded-xl border border-border p-6">
            <label className="block text-sm font-medium text-foreground mb-3">Thumbnail</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailChange}
            />
            {thumbnailPreview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden group">
                <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="w-full h-48 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-primary"
              >
                <ImagePlus className="w-8 h-8" />
                <span className="text-sm font-medium">Click to upload thumbnail</span>
                <span className="text-xs">PNG, JPG up to 5MB</span>
              </button>
            )}
          </div>

          {/* Title + Description */}
          <div className="bg-white rounded-xl border border-border p-6 space-y-5">
            {/* Title */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">Title <span className="text-destructive">*</span></label>
                <span className={`text-xs ${title.length > 60 ? "text-destructive" : "text-muted-foreground"}`}>
                  {title.length}/60
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Python for beginners"
                maxLength={60}
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">Description <span className="text-destructive">*</span></label>
                <span className={`text-xs ${description.length > 250 ? "text-destructive" : "text-muted-foreground"}`}>
                  {description.length}/250
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn in this course?"
                maxLength={250}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl border border-border p-6">
            <label className="block text-sm font-medium text-foreground mb-3">Skills</label>
            <div className="flex gap-2 mb-3">
              <input
                ref={skillInputRef}
                type="text"
                onKeyDown={handleSkillKeyDown}
                placeholder="e.g. Python"
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
              <Button type="button" variant="outline" onClick={addSkill} className="shrink-0">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-destructive transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/instructor/courses")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </div>
    </InstructorLayout>
  );
}
