import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react"
import {
  useCreateSurveyTemplate,
  useUpdateSurveyTemplate,
  type SurveyTemplateFormValues,
} from "./-useSurveyTemplateMutation"
import type { SurveyTemplateRow } from "@/lib/queries/useSurveyTemplates"

const QUESTION_PLACEHOLDER: SurveyTemplateFormValues["questions"][0] = {
  id: "",
  text: "",
  category: "",
}

export function SurveyTemplateFormDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: SurveyTemplateRow
}) {
  // Keyed by open state + template so the inner form remounts with fresh state
  // every time the dialog opens (avoids setState-in-effect).
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <SurveyTemplateFormInner
          key={`${template?.id ?? "new"}-${open}`}
          template={template}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Dialog>
  )
}

function SurveyTemplateFormInner({
  template,
  onClose,
}: {
  template?: SurveyTemplateRow
  onClose: () => void
}) {
  const [name, setName] = useState(template?.name ?? "")
  const [description, setDescription] = useState(template?.description ?? "")
  const [isActive, setIsActive] = useState(template?.is_active ?? true)
  const [questions, setQuestions] = useState<SurveyTemplateFormValues["questions"]>(
    template?.questions?.map((q) => ({ ...q })) ?? [QUESTION_PLACEHOLDER]
  )

  const createTemplate = useCreateSurveyTemplate()
  const updateTemplate = useUpdateSurveyTemplate()

  const isEditing = Boolean(template)
  const isSubmitting = createTemplate.isPending || updateTemplate.isPending

  const addQuestion = () => {
    setQuestions([...questions, { ...QUESTION_PLACEHOLDER, id: `q${questions.length + 1}` }])
  }

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: "text" | "category", value: string) => {
    setQuestions(
      questions.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    )
  }

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const newQuestions = [...questions]
    const [removed] = newQuestions.splice(fromIndex, 1)
    newQuestions.splice(toIndex, 0, removed)
    setQuestions(newQuestions)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const values: SurveyTemplateFormValues = {
      name,
      description: description || null,
      is_active: isActive,
      questions: questions
        .filter((q) => q.text.trim())
        .map((q, i) => ({
          ...q,
          id: q.id || `q${i + 1}`,
        })),
    }
    if (isEditing && template) {
      await updateTemplate.mutateAsync({ id: template.id, values })
    } else {
      await createTemplate.mutateAsync(values)
    }
    onClose()
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Survey Template" : "Create Survey Template"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the template name, description, status, and questions. Changing questions will create a new version."
            : "Define a new survey template with questions. Version 1 will be created automatically."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template-name">Name</Label>
          <Input
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Q3 2026 Client Satisfaction Survey"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-description">Description</Label>
          <Textarea
            id="template-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description of this template"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-active">Status</Label>
          <select
            id="template-active"
            value={isActive ? "active" : "inactive"}
            onChange={(e) => setIsActive(e.target.value === "active")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="mb-0">Questions</Label>
            <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
              <Plus className="mr-1 size-4" />
              Add Question
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum 1 question required. Reorder with drag handles.
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground mt-1"
                  onClick={() => removeQuestion(index)}
                  disabled={questions.length <= 1}
                >
                  <Trash2 className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground mt-1"
                  onClick={() => index > 0 && moveQuestion(index, index - 1)}
                  disabled={index === 0}
                >
                  <GripVertical className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground mt-1"
                  onClick={() =>
                    index < questions.length - 1 && moveQuestion(index, index + 1)
                  }
                  disabled={index >= questions.length - 1}
                >
                  <GripVertical className="size-4 rotate-180" />
                </Button>
                <div className="flex-1 space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor={`q-${index}-text`} className="text-xs font-medium">
                      Question Text
                    </Label>
                    <Input
                      id={`q-${index}-text`}
                      value={question.text}
                      onChange={(e) => updateQuestion(index, "text", e.target.value)}
                      placeholder="e.g. How satisfied are you with our communication?"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`q-${index}-category`} className="text-xs font-medium">
                      Category
                    </Label>
                    <Input
                      id={`q-${index}-category`}
                      value={question.category}
                      onChange={(e) => updateQuestion(index, "category", e.target.value)}
                      placeholder="e.g. Communication"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Create Template"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}