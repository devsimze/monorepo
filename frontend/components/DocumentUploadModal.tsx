'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

type DocumentCategory = 'lease_agreement' | 'payment_receipt' | 'identity_document' | 'inspection_report' | 'other'

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  lease_agreement: 'Lease Agreement',
  payment_receipt: 'Payment Receipt',
  identity_document: 'Identity Document',
  inspection_report: 'Inspection Report',
  other: 'Other',
}

const uploadSchema = z.object({
  category: z.enum(['lease_agreement', 'payment_receipt', 'identity_document', 'inspection_report', 'other']),
  description: z.string().max(500).optional(),
  dealId: z.string().optional(),
})

type UploadFormData = z.infer<typeof uploadSchema>

interface DocumentUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DocumentUploadModal({ open, onOpenChange, onSuccess }: DocumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      category: 'other',
    },
  })

  const category = watch('category')

  const onSubmit = async (data: UploadFormData) => {
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Only PDF, JPG, and PNG files are allowed')
      return
    }

    // Validate file size (20MB)
    if (selectedFile.size > 20 * 1024 * 1024) {
      toast.error('File size must not exceed 20MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('category', data.category)
      if (data.description) formData.append('description', data.description)
      if (data.dealId) formData.append('dealId', data.dealId)

      const token = localStorage.getItem('shelterflex_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/v1/tenant/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Upload failed')
      }

      toast.success('Document uploaded successfully')
      setSelectedFile(null)
      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-2 border-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upload Document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Document File</label>
            {selectedFile ? (
              <Card className="border-2 border-border p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-foreground break-words">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 hover:bg-border rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </Card>
            ) : (
              <label className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="font-bold text-foreground">Click to upload</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 20MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setSelectedFile(file)
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Category *</label>
            <select
              {...register('category')}
              className="w-full border-2 border-border rounded-lg p-2 bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-foreground"
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Description</label>
            <textarea
              {...register('description')}
              placeholder="Optional description..."
              maxLength={500}
              rows={3}
              className="w-full border-2 border-border rounded-lg p-2 bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-foreground resize-none"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Deal ID */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Deal ID (Optional)</label>
            <input
              {...register('dealId')}
              type="text"
              placeholder="Link to a specific deal..."
              className="w-full border-2 border-border rounded-lg p-2 bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-foreground"
            />
            {errors.dealId && (
              <p className="text-sm text-red-600 mt-1">{errors.dealId.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 border-2 border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || uploading}
              className="flex-1 bg-foreground text-background hover:bg-foreground/90 font-bold border-2 border-foreground"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
