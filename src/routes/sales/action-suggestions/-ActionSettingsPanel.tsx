import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import {
  ChevronDown,
  ChevronUp,
  Settings,
  Save,
} from "lucide-react"
import {
  useActionSettingsQuery,
  useUpdateActionSettingsMutation,
} from "./-useActionSettingsQuery"

const DEFAULTS: Record<string, number> = {
  opportunity_stalled_days: 14,
  opportunity_closing_soon_days: 30,
  opportunity_max_stalled_actions: 3,
  opportunity_max_closing_actions: 3,
  opportunity_max_missing_date_actions: 2,
  satisfaction_low_score_threshold: 3,
  satisfaction_high_score_threshold: 4,
  satisfaction_max_low_score_actions: 2,
  satisfaction_max_at_risk_actions: 2,
  satisfaction_max_pending_actions: 2,
  action_cap: 8,
}

const FIELD_LABELS: Record<string, { label: string; description: string }> = {
  opportunity_stalled_days: {
    label: "Stalled threshold (days)",
    description: "Days in same stage before a deal is flagged stalled",
  },
  opportunity_closing_soon_days: {
    label: "Closing soon window (days)",
    description: "Days within expected close date to flag as closing soon",
  },
  opportunity_max_stalled_actions: {
    label: "Max stalled suggestions",
    description: "Maximum stalled deal suggestions to display",
  },
  opportunity_max_closing_actions: {
    label: "Max closing-soon suggestions",
    description: "Maximum closing-soon deal suggestions to display",
  },
  opportunity_max_missing_date_actions: {
    label: "Max missing-date suggestions",
    description: "Maximum missing close-date suggestions to display",
  },
  satisfaction_low_score_threshold: {
    label: "Low score threshold",
    description: "Scores below this value are flagged as low satisfaction",
  },
  satisfaction_high_score_threshold: {
    label: "High score threshold",
    description: "Scores at or above this value are considered high satisfaction",
  },
  satisfaction_max_low_score_actions: {
    label: "Max low-score suggestions",
    description: "Maximum low-score follow-up suggestions to display",
  },
  satisfaction_max_at_risk_actions: {
    label: "Max at-risk suggestions",
    description: "Maximum at-risk client suggestions to display",
  },
  satisfaction_max_pending_actions: {
    label: "Max pending survey suggestions",
    description: "Maximum pending survey chase suggestions to display",
  },
  action_cap: {
    label: "Total action cap",
    description: "Maximum total suggested actions returned per category",
  },
}

export function ActionSettingsPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const settingsQuery = useActionSettingsQuery()
  const updateMutation = useUpdateActionSettingsMutation()

  const serverSettings = settingsQuery.data ?? {}
  const [formValues, setFormValues] = useState<Record<string, string> | null>(null)

  const values: Record<string, string> = formValues ?? {
    ...Object.fromEntries(
      Object.keys(DEFAULTS).map((key) => [key, String(DEFAULTS[key])])
    ),
    ...serverSettings,
  }

  function handleChange(key: string, value: string) {
    setFormValues((prev) => ({
      ...(prev ?? values),
      [key]: value,
    }))
  }

  function handleSave() {
    const numeric: Record<string, number> = {}
    for (const key of Object.keys(DEFAULTS)) {
      numeric[key] = Number(values[key]) || DEFAULTS[key]
    }
    updateMutation.mutate(numeric, {
      onSuccess: () => setFormValues(null),
    })
  }

  if (settingsQuery.isLoading) {
    return null
  }

  return (
    <Card>
      <button
        type="button"
        className="flex w-full items-center text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardHeader className="flex-1 cursor-pointer">
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <Settings className="size-4 text-primary" />
            Threshold Settings
            <Badge variant="outline" className="ml-auto">
              Admin only
            </Badge>
          </CardTitle>
          <CardDescription>
            Configure the threshold triggers that determine when action
            suggestions are generated.
          </CardDescription>
        </CardHeader>
        <div className="pr-4">
          {isExpanded ? (
            <ChevronUp className="size-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-6" />

          <div className="space-y-6">
            <div>
              <h4 className="mb-3 text-sm font-semibold">
                Opportunity Pipeline Thresholds
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "opportunity_stalled_days",
                  "opportunity_closing_soon_days",
                  "opportunity_max_stalled_actions",
                  "opportunity_max_closing_actions",
                  "opportunity_max_missing_date_actions",
                ].map((key) => (
                  <SettingField
                    key={key}
                    settingKey={key}
                    value={values[key] ?? ""}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="mb-3 text-sm font-semibold">
                Client Satisfaction Thresholds
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "satisfaction_low_score_threshold",
                  "satisfaction_high_score_threshold",
                  "satisfaction_max_low_score_actions",
                  "satisfaction_max_at_risk_actions",
                  "satisfaction_max_pending_actions",
                ].map((key) => (
                  <SettingField
                    key={key}
                    settingKey={key}
                    value={values[key] ?? ""}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="mb-3 text-sm font-semibold">Global</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <SettingField
                  settingKey="action_cap"
                  value={values["action_cap"] ?? ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Spinner className="size-4" />
              ) : (
                <Save className="size-4" />
              )}
              {updateMutation.isPending ? "Saving…" : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function SettingField({
  settingKey,
  value,
  onChange,
}: {
  settingKey: string
  value: string
  onChange: (key: string, value: string) => void
}) {
  const meta = FIELD_LABELS[settingKey]

  return (
    <div className="space-y-1.5">
      <Label htmlFor={settingKey} className="text-sm">
        {meta?.label ?? settingKey}
      </Label>
      <Input
        id={settingKey}
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(settingKey, e.target.value)}
      />
      {meta?.description && (
        <p className="text-xs text-muted-foreground">{meta.description}</p>
      )}
    </div>
  )
}
