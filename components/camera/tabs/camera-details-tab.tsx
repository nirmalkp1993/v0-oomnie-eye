'use client'

import { useState, useEffect, useMemo, useRef, useId } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Camera, Info, Eye, EyeOff, Trash2, CloudUpload, ChevronRight } from 'lucide-react'
import type { Camera as CameraType } from '@/types/camera'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const ACCEPT_IMAGE = 'image/jpeg,image/png,image/webp,image/gif'

const API_BASE_PRESETS = [
  '/osc/commands/execute',
  '/onvif/device_service',
  '/api/v1/commands',
  '/cgi-bin/hi3510/param.cgi',
]

function cameraToForm(c: CameraType) {
  return {
    name: c.name,
    ip: c.ip,
    type: c.type,
    cameraId: c.cameraId,
    port: c.port.toString(),
    apiBaseUrl: c.apiBaseUrl,
    telnetUsername: c.telnetUsername,
    telnetPassword: c.telnetPassword,
    cameraPassword: c.cameraPassword,
    mediaMtxUrl: c.mediaMtxUrl || '',
    uniqueIdentifier: c.uniqueIdentifier || '',
    thumbnail: c.thumbnail || '',
  }
}

type FormState = ReturnType<typeof cameraToForm>

const EMPTY_FORM: FormState = {
  name: '',
  ip: '',
  type: 'RTSP',
  cameraId: '',
  port: '554',
  apiBaseUrl: '',
  telnetUsername: '',
  telnetPassword: '',
  cameraPassword: '',
  mediaMtxUrl: '',
  uniqueIdentifier: '',
  thumbnail: '',
}

function formMatchesCamera(form: FormState, camera: CameraType): boolean {
  const saved = cameraToForm(camera)
  return (Object.keys(form) as (keyof FormState)[]).every(
    (k) => form[k] === saved[k],
  )
}

function FloatingField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  className,
  endAdornment,
  inputClassName,
  list,
  inputMode,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  className?: string
  endAdornment?: React.ReactNode
  inputClassName?: string
  list?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
}) {
  const [focused, setFocused] = useState(false)
  const raised = focused || value.length > 0

  return (
    <div className={cn('relative', className)}>
      <Input
        id={id}
        type={type}
        value={value}
        list={list}
        inputMode={inputMode}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          'h-[52px] w-full min-w-0 rounded-md border border-border bg-input pb-2.5 pt-5 text-base text-foreground shadow-none transition-[color,box-shadow] md:text-sm',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          endAdornment && 'pr-11',
          inputClassName,
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          'pointer-events-none absolute left-3 z-20 max-w-[calc(100%-2rem)] origin-[0_0] truncate transition-all duration-200 ease-out',
          raised
            ? 'top-0 -translate-y-1/2 bg-card px-1 text-[11px] font-semibold leading-none text-primary'
            : 'top-[26px] -translate-y-1/2 bg-transparent px-0 text-sm font-normal text-muted-foreground',
        )}
      >
        {label}
      </label>
      {endAdornment ? (
        <div className="pointer-events-auto absolute right-1.5 top-1/2 z-20 -translate-y-1/2">
          {endAdornment}
        </div>
      ) : null}
    </div>
  )
}

function SectionHeader({
  title,
  tooltip,
}: {
  title: string
  tooltip: string
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-2.5">
      <h3 className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="rounded-full text-muted-foreground outline-offset-2 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            aria-label={`About ${title}`}
          >
            <Info className="size-4 shrink-0" strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export function CameraDetailsTab() {
  const { selectedCamera, updateCamera } = useCameraStore()
  const baseId = useId()
  const fileRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<FormState>(() =>
    selectedCamera ? cameraToForm(selectedCamera) : EMPTY_FORM,
  )
  const [showTelnetPassword, setShowTelnetPassword] = useState(false)
  const [showCameraPassword, setShowCameraPassword] = useState(false)
  const [typeSelectOpen, setTypeSelectOpen] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedCamera) {
      setFormData(cameraToForm(selectedCamera))
      setImageError(null)
    }
  }, [selectedCamera])

  const isDirtyResolved = useMemo(() => {
    if (!selectedCamera) return false
    return !formMatchesCamera(formData, selectedCamera)
  }, [formData, selectedCamera])

  const hasImage = Boolean(formData.thumbnail?.length)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCamera || !isDirtyResolved) return
    updateCamera(selectedCamera.id, {
      name: formData.name,
      ip: formData.ip,
      type: formData.type,
      cameraId: formData.cameraId,
      port: parseInt(formData.port, 10) || 554,
      apiBaseUrl: formData.apiBaseUrl,
      telnetUsername: formData.telnetUsername,
      telnetPassword: formData.telnetPassword,
      cameraPassword: formData.cameraPassword,
      mediaMtxUrl: formData.mediaMtxUrl,
      uniqueIdentifier: formData.uniqueIdentifier,
      thumbnail: formData.thumbnail,
    })
  }

  const handleReset = () => {
    if (!selectedCamera) return
    setFormData(cameraToForm(selectedCamera))
    setImageError(null)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose a JPEG, PNG, WebP, or GIF file.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('File is too large. Maximum size is 8 MB.')
      return
    }
    setImageError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        setFormData((prev) => ({ ...prev, thumbnail: result }))
      }
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, thumbnail: '' }))
    setImageError(null)
  }

  if (!selectedCamera) return null

  const id = (name: string) => `${baseId}-${name}`
  const datalistId = `${baseId}-api-presets`

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-stretch">
        {/* Form column */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 min-w-0 flex-col border-border lg:border-e"
        >
          <div className="space-y-8 p-6 sm:p-8">
            <section className="space-y-4">
              <SectionHeader
                title="Camera identity"
                tooltip="Basic identifiers used across management views, exports, and integrations."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingField
                  id={id('name')}
                  label="Camera name"
                  value={formData.name}
                  onChange={(v) => setFormData((p) => ({ ...p, name: v }))}
                  autoComplete="off"
                />
                <FloatingField
                  id={id('cameraId')}
                  label="Camera ID"
                  value={formData.cameraId}
                  onChange={(v) => setFormData((p) => ({ ...p, cameraId: v }))}
                  autoComplete="off"
                />
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-0 z-20 -translate-y-1/2 bg-card px-1 text-[11px] font-semibold leading-none text-primary">
                  Type
                </span>
                <Select
                  value={formData.type}
                  open={typeSelectOpen}
                  onOpenChange={setTypeSelectOpen}
                  onValueChange={(value) =>
                    setFormData((p) => ({
                      ...p,
                      type: value as CameraType['type'],
                    }))
                  }
                >
                  <SelectTrigger
                    className={cn(
                      'h-[52px] w-full min-w-0 border-border bg-input pb-2.5 pt-5 text-foreground shadow-none',
                      'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    <SelectItem value="RTSP">RTSP</SelectItem>
                    <SelectItem value="ONVIF">ONVIF</SelectItem>
                    <SelectItem value="USB">USB</SelectItem>
                    <SelectItem value="HTTP">HTTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeader
                title="Network and API"
                tooltip="Connection endpoint for streaming and control commands. Port 554 is typical for RTSP."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingField
                  id={id('ip')}
                  label="IP"
                  value={formData.ip}
                  onChange={(v) => setFormData((p) => ({ ...p, ip: v }))}
                  autoComplete="off"
                />
                <FloatingField
                  id={id('port')}
                  label="Port"
                  value={formData.port}
                  onChange={(v) => setFormData((p) => ({ ...p, port: v }))}
                  inputMode="numeric"
                  autoComplete="off"
                />
              </div>
              <div>
                <FloatingField
                  id={id('api')}
                  label="API base URL"
                  value={formData.apiBaseUrl}
                  onChange={(v) => setFormData((p) => ({ ...p, apiBaseUrl: v }))}
                  list={datalistId}
                  inputClassName="font-mono text-sm"
                  autoComplete="off"
                />
                <datalist id={datalistId}>
                  {API_BASE_PRESETS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeader
                title="Access credentials"
                tooltip="Credentials for telnet maintenance and the camera web or API login. Stored securely on the server in production."
              />
              <FloatingField
                id={id('telnetUser')}
                label="Telnet username"
                value={formData.telnetUsername}
                onChange={(v) =>
                  setFormData((p) => ({ ...p, telnetUsername: v }))
                }
                autoComplete="username"
              />
              <FloatingField
                id={id('telnetPass')}
                label="Telnet password"
                type={showTelnetPassword ? 'text' : 'password'}
                value={formData.telnetPassword}
                onChange={(v) =>
                  setFormData((p) => ({ ...p, telnetPassword: v }))
                }
                autoComplete="current-password"
                endAdornment={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowTelnetPassword((s) => !s)}
                    aria-label={
                      showTelnetPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showTelnetPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                }
              />
              <FloatingField
                id={id('camPass')}
                label="Camera password"
                type={showCameraPassword ? 'text' : 'password'}
                value={formData.cameraPassword}
                onChange={(v) =>
                  setFormData((p) => ({ ...p, cameraPassword: v }))
                }
                autoComplete="current-password"
                endAdornment={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCameraPassword((s) => !s)}
                    aria-label={
                      showCameraPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showCameraPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                }
              />
            </section>

            <details className="group rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 transition-colors open:bg-muted/30">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-foreground outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                Advanced — streaming and identifiers
              </summary>
              <div className="mt-4 space-y-4 pb-1">
                <FloatingField
                  id={id('media')}
                  label="MediaMTX URL"
                  value={formData.mediaMtxUrl}
                  onChange={(v) =>
                    setFormData((p) => ({ ...p, mediaMtxUrl: v }))
                  }
                  inputClassName="font-mono text-sm"
                  autoComplete="off"
                />
                <FloatingField
                  id={id('unique')}
                  label="Unique identifier"
                  value={formData.uniqueIdentifier}
                  onChange={(v) =>
                    setFormData((p) => ({ ...p, uniqueIdentifier: v }))
                  }
                  inputClassName="font-mono text-sm"
                  autoComplete="off"
                />
              </div>
            </details>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-end gap-3 border-t border-border bg-muted/25 px-6 py-4 sm:px-8">
            <Button
              type="button"
              variant="outline"
              disabled={!isDirtyResolved}
              onClick={handleReset}
              className="min-w-[9rem] border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Reset changes
            </Button>
            <Button
              type="submit"
              disabled={!isDirtyResolved}
              className="min-w-[9rem] bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              Save changes
            </Button>
          </div>
        </form>

        {/* Image column */}
        <aside className="flex min-h-0 min-w-0 flex-col border-t border-border bg-muted/15 p-6 sm:p-8 lg:border-t-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Camera image
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-full text-muted-foreground outline-offset-2 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  aria-label="About camera image"
                >
                  <Info className="size-4 shrink-0" strokeWidth={2} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                Reference still shown in camera lists, cards, and placemark quick
                views. Square or 4:3 images work best.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Upload a reference still for this camera. It appears in management
            views and placemark quick views.
          </p>

          <div
            className={cn(
              'relative mt-5 flex min-h-[220px] flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/20 px-4 py-10 text-center transition-colors',
              hasImage && 'border-solid border-border bg-background/80',
            )}
          >
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URLs / arbitrary preview sources
              <img
                src={formData.thumbnail}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <>
                <Camera
                  className="mb-3 size-14 text-muted-foreground/45"
                  strokeWidth={1.25}
                />
                <p className="text-sm font-medium text-muted-foreground">
                  No image uploaded yet.
                </p>
              </>
            )}
          </div>

          {imageError ? (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {imageError}
            </p>
          ) : null}

          <div className="mt-5 flex flex-row flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT_IMAGE}
              className="sr-only"
              onChange={handleFile}
            />
            <Button
              type="button"
              className="gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              onClick={() => fileRef.current?.click()}
            >
              <CloudUpload className="size-4 shrink-0" />
              Upload image
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!hasImage}
              className="gap-2 border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
              onClick={removeImage}
            >
              <Trash2 className="size-4 shrink-0" />
              Remove image
            </Button>
          </div>

          <p className="mt-4 text-xs leading-normal text-muted-foreground">
            JPEG, PNG, WebP, or GIF up to 8 MB.
          </p>
        </aside>
      </div>
    </div>
  )
}
