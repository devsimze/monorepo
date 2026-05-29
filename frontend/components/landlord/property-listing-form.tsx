"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  GripVertical,
  Star,
  Upload,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NIGERIAN_CITIES,
  PROPERTY_AMENITIES,
  PROPERTY_AMENITY_LABELS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
  type PropertyAmenity,
  type PropertyType,
} from "@/lib/amenities";
import {
  computeMarginPreview,
  MIN_OUTRIGHT_MARGIN_PERCENT,
  type LandlordPropertyRecord,
  type PropertyListingPayload,
} from "@/lib/landlordPropertiesApi";
import { cn } from "@/lib/utils";

export interface ListingPhoto {
  id: string;
  preview: string;
  file?: File;
}

export interface PropertyListingFormValues {
  title: string;
  address: string;
  city: string;
  area: string;
  propertyType: PropertyType | "";
  bedrooms: string;
  bathrooms: string;
  sqm: string;
  description: string;
  amenities: PropertyAmenity[];
  photos: ListingPhoto[];
  primaryPhotoId: string | null;
  negotiatedLandlordRateNgn: string;
  outrightPriceNgn: string;
  installmentBasePriceNgn: string;
  videoUrl: string;
}

const STEP_LABELS = [
  "Property Details",
  "Amenities",
  "Media",
  "Pricing",
  "Review & Submit",
];

function defaultValues(
  initial?: LandlordPropertyRecord,
): PropertyListingFormValues {
  if (!initial) {
    return {
      title: "",
      address: "",
      city: "",
      area: "",
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
      sqm: "",
      description: "",
      amenities: [],
      photos: [],
      primaryPhotoId: null,
      negotiatedLandlordRateNgn: "",
      outrightPriceNgn: "",
      installmentBasePriceNgn: "",
      videoUrl: "",
    };
  }

  return {
    title: initial.title,
    address: initial.address,
    city: initial.city ?? "",
    area: initial.area ?? "",
    propertyType: initial.propertyType ?? "",
    bedrooms: String(initial.bedrooms),
    bathrooms: String(initial.bathrooms),
    sqm: initial.sqm != null ? String(initial.sqm) : "",
    description: initial.description ?? "",
    amenities: initial.amenities ?? [],
    photos: initial.photos.map((url, index) => ({
      id: `existing-${index}`,
      preview: url,
    })),
    primaryPhotoId:
      initial.photos.length > 0
        ? `existing-${initial.primaryPhotoIndex ?? 0}`
        : null,
    negotiatedLandlordRateNgn: String(
      initial.negotiatedLandlordRateNgn ?? initial.annualRentNgn,
    ),
    outrightPriceNgn: String(initial.outrightPriceNgn ?? ""),
    installmentBasePriceNgn: String(
      initial.installmentBasePriceNgn ?? initial.annualRentNgn,
    ),
    videoUrl: initial.videoUrl ?? "",
  };
}

async function photosToPayload(
  photos: ListingPhoto[],
  primaryPhotoId: string | null,
): Promise<{ photos: string[]; primaryPhotoIndex: number }> {
  const ordered = [...photos];
  const primaryIdx = primaryPhotoId
    ? ordered.findIndex((p) => p.id === primaryPhotoId)
    : 0;
  if (primaryIdx > 0) {
    const [primary] = ordered.splice(primaryIdx, 1);
    ordered.unshift(primary);
  }

  const urls: string[] = [];
  for (const photo of ordered) {
    if (photo.file) {
      const dataUrl = await readFileAsDataUrl(photo.file);
      urls.push(dataUrl);
    } else {
      urls.push(photo.preview);
    }
  }

  return { photos: urls, primaryPhotoIndex: 0 };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function buildListingPayload(
  values: PropertyListingFormValues,
  photoUrls: string[],
): PropertyListingPayload {
  return {
    title: values.title.trim(),
    address: values.address.trim(),
    city: values.city || undefined,
    area: values.area || undefined,
    propertyType: values.propertyType || undefined,
    bedrooms: parseInt(values.bedrooms, 10),
    bathrooms: parseInt(values.bathrooms, 10),
    sqm: values.sqm ? parseFloat(values.sqm) : undefined,
    description: values.description || undefined,
    amenities: values.amenities,
    photos: photoUrls,
    primaryPhotoIndex: 0,
    photoOrder: photoUrls,
    negotiatedLandlordRateNgn: parseFloat(values.negotiatedLandlordRateNgn),
    outrightPriceNgn: parseFloat(values.outrightPriceNgn),
    installmentBasePriceNgn: parseFloat(values.installmentBasePriceNgn),
    videoUrl: values.videoUrl.trim() || undefined,
  };
}

interface PropertyListingFormProps {
  mode: "create" | "edit";
  initialProperty?: LandlordPropertyRecord;
  onSubmit: (payload: PropertyListingPayload) => Promise<void>;
  submitLabel?: string;
}

export function PropertyListingForm({
  mode,
  initialProperty,
  onSubmit,
  submitLabel,
}: PropertyListingFormProps) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<PropertyListingFormValues>(() =>
    defaultValues(initialProperty),
  );
  const [submitting, setSubmitting] = useState(false);
  const [dragPhotoId, setDragPhotoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoIdRef = useRef(0);

  const margin = useMemo(() => {
    const negotiated = parseFloat(values.negotiatedLandlordRateNgn) || 0;
    const outright = parseFloat(values.outrightPriceNgn) || 0;
    const installment = parseFloat(values.installmentBasePriceNgn) || 0;
    if (!negotiated || !outright || !installment) return null;
    return computeMarginPreview(negotiated, outright, installment);
  }, [
    values.negotiatedLandlordRateNgn,
    values.outrightPriceNgn,
    values.installmentBasePriceNgn,
  ]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;

    setValues((prev) => {
      const remaining = 20 - prev.photos.length;
      const toAdd = list.slice(0, remaining).map((file) => {
        photoIdRef.current += 1;
        return {
          id: `photo-${photoIdRef.current}`,
          preview: URL.createObjectURL(file),
          file,
        };
      });
      const photos = [...prev.photos, ...toAdd];
      return {
        ...prev,
        photos,
        primaryPhotoId: prev.primaryPhotoId ?? toAdd[0]?.id ?? null,
      };
    });
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removePhoto = (id: string) => {
    setValues((prev) => {
      const photo = prev.photos.find((p) => p.id === id);
      if (photo?.preview.startsWith("blob:")) {
        URL.revokeObjectURL(photo.preview);
      }
      const photos = prev.photos.filter((p) => p.id !== id);
      return {
        ...prev,
        photos,
        primaryPhotoId:
          prev.primaryPhotoId === id
            ? (photos[0]?.id ?? null)
            : prev.primaryPhotoId,
      };
    });
  };

  const reorderPhoto = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setValues((prev) => {
      const photos = [...prev.photos];
      const fromIdx = photos.findIndex((p) => p.id === fromId);
      const toIdx = photos.findIndex((p) => p.id === toId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const [moved] = photos.splice(fromIdx, 1);
      photos.splice(toIdx, 0, moved);
      return { ...prev, photos };
    });
  };

  const toggleAmenity = (amenity: PropertyAmenity) => {
    setValues((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const canProceedFromMedia = values.photos.length >= 3 && values.photos.length <= 20;

  const handleSubmit = async () => {
    if (!canProceedFromMedia) return;
    setSubmitting(true);
    try {
      const { photos } = await photosToPayload(values.photos, values.primaryPhotoId);
      const payload = buildListingPayload(values, photos);
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {STEP_LABELS.map((label, index) => {
          const n = index + 1;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setStep(n)}
              className={cn(
                "border-2 border-foreground px-3 py-2 text-sm font-bold",
                step === n ? "bg-primary" : "bg-card",
              )}
            >
              {n}. {label}
            </button>
          );
        })}
      </div>

      {step === 1 && (
        <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <h2 className="mb-4 text-xl font-bold">Property Details</h2>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={values.title}
                onChange={(e) => setValues({ ...values, title: e.target.value })}
                className="border-2 border-foreground"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Property type</Label>
                <Select
                  value={values.propertyType}
                  onValueChange={(v) =>
                    setValues({ ...values, propertyType: v as PropertyType })
                  }
                >
                  <SelectTrigger className="border-2 border-foreground">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {PROPERTY_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>City</Label>
                <Select
                  value={values.city}
                  onValueChange={(v) => setValues({ ...values, city: v })}
                >
                  <SelectTrigger className="border-2 border-foreground">
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="area">Neighbourhood / area</Label>
              <Input
                id="area"
                value={values.area}
                onChange={(e) => setValues({ ...values, area: e.target.value })}
                className="border-2 border-foreground"
              />
            </div>
            <div>
              <Label htmlFor="address">Full address</Label>
              <Input
                id="address"
                value={values.address}
                onChange={(e) => setValues({ ...values, address: e.target.value })}
                className="border-2 border-foreground"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="beds">Bedrooms</Label>
                <Input
                  id="beds"
                  type="number"
                  min={0}
                  value={values.bedrooms}
                  onChange={(e) =>
                    setValues({ ...values, bedrooms: e.target.value })
                  }
                  className="border-2 border-foreground"
                />
              </div>
              <div>
                <Label htmlFor="baths">Bathrooms</Label>
                <Input
                  id="baths"
                  type="number"
                  min={0}
                  value={values.bathrooms}
                  onChange={(e) =>
                    setValues({ ...values, bathrooms: e.target.value })
                  }
                  className="border-2 border-foreground"
                />
              </div>
              <div>
                <Label htmlFor="sqm">Floor area (sqm)</Label>
                <Input
                  id="sqm"
                  type="number"
                  min={0}
                  value={values.sqm}
                  onChange={(e) => setValues({ ...values, sqm: e.target.value })}
                  className="border-2 border-foreground"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={values.description}
                onChange={(e) =>
                  setValues({ ...values, description: e.target.value })
                }
                className="border-2 border-foreground"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="button" onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <h2 className="mb-4 text-xl font-bold">Amenities</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {PROPERTY_AMENITIES.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={cn(
                  "border-2 border-foreground p-3 text-left text-sm font-medium",
                  values.amenities.includes(amenity)
                    ? "bg-secondary"
                    : "bg-card",
                )}
              >
                {PROPERTY_AMENITY_LABELS[amenity]}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="button" onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <h2 className="mb-2 text-xl font-bold">Media</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Upload 3–20 photos. Drag to reorder; star your primary photo.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="mb-6 flex flex-col items-center border-3 border-dashed border-foreground bg-muted/40 p-10"
          >
            <Upload className="mb-2 h-10 w-10" />
            <p className="font-medium">Drag & drop photos here</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
              disabled={values.photos.length >= 20}
            >
              Browse files
            </Button>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {values.photos.map((photo) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => setDragPhotoId(photo.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragPhotoId) reorderPhoto(dragPhotoId, photo.id);
                  setDragPhotoId(null);
                }}
                className="relative aspect-video border-2 border-foreground bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-1 top-1 flex gap-1">
                  <span className="bg-background/90 p-1">
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <button
                    type="button"
                    aria-label="Set as primary photo"
                    onClick={() =>
                      setValues({ ...values, primaryPhotoId: photo.id })
                    }
                    className={cn(
                      "border border-foreground bg-background/90 p-1",
                      values.primaryPhotoId === photo.id && "bg-primary",
                    )}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute right-1 top-1 bg-destructive p-1 text-destructive-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <p
            className={cn(
              "text-sm font-medium",
              !canProceedFromMedia && "text-destructive",
            )}
          >
            {values.photos.length} / 20 photos (minimum 3 required)
          </p>
          <div className="mt-4">
            <Label htmlFor="videoUrl">Video URL (optional)</Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://..."
              value={values.videoUrl}
              onChange={(e) =>
                setValues({ ...values, videoUrl: e.target.value })
              }
              className="border-2 border-foreground"
            />
          </div>
          <div className="mt-6 flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              type="button"
              onClick={() => setStep(4)}
              disabled={!canProceedFromMedia}
            >
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <h2 className="mb-4 text-xl font-bold">Pricing</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Negotiated landlord rate (₦)</Label>
              <Input
                type="number"
                value={values.negotiatedLandlordRateNgn}
                onChange={(e) =>
                  setValues({
                    ...values,
                    negotiatedLandlordRateNgn: e.target.value,
                  })
                }
                className="border-2 border-foreground"
              />
            </div>
            <div>
              <Label>Outright (cash) price (₦)</Label>
              <Input
                type="number"
                value={values.outrightPriceNgn}
                onChange={(e) =>
                  setValues({ ...values, outrightPriceNgn: e.target.value })
                }
                className="border-2 border-foreground"
              />
            </div>
            <div>
              <Label>Installment base price (₦)</Label>
              <Input
                type="number"
                value={values.installmentBasePriceNgn}
                onChange={(e) =>
                  setValues({
                    ...values,
                    installmentBasePriceNgn: e.target.value,
                  })
                }
                className="border-2 border-foreground"
              />
            </div>
          </div>
          {margin && (
            <div
              className={cn(
                "mt-4 border-2 border-foreground p-4",
                margin.belowRecommended || margin.orderInvalid
                  ? "bg-destructive/10"
                  : "bg-muted",
              )}
            >
              <p className="font-bold">Margin preview</p>
              <p className="text-sm">
                Outright margin: {margin.outrightMarginPercent.toFixed(1)}%
                (recommended ≥ {MIN_OUTRIGHT_MARGIN_PERCENT * 100}%)
              </p>
              <p className="text-sm">
                Installment headroom:{" "}
                {margin.installmentMarginPercent.toFixed(1)}%
              </p>
              {margin.orderInvalid && (
                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Outright price must not exceed installment base price.
                </p>
              )}
              {margin.belowRecommended && !margin.orderInvalid && (
                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Outright margin is below the recommended threshold.
                </p>
              )}
            </div>
          )}
          <div className="mt-6 flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button
              type="button"
              onClick={() => setStep(5)}
              disabled={margin?.orderInvalid}
            >
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 5 && (
        <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <h2 className="mb-4 text-xl font-bold">Review & Submit</h2>
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="font-bold">Title</dt>
              <dd>{values.title}</dd>
            </div>
            <div>
              <dt className="font-bold">Location</dt>
              <dd>
                {[values.area, values.city].filter(Boolean).join(", ")} —{" "}
                {values.address}
              </dd>
            </div>
            <div>
              <dt className="font-bold">Beds / baths / sqm</dt>
              <dd>
                {values.bedrooms} / {values.bathrooms}
                {values.sqm ? ` / ${values.sqm} sqm` : ""}
              </dd>
            </div>
            <div>
              <dt className="font-bold">Amenities</dt>
              <dd>
                {values.amenities.length
                  ? values.amenities
                      .map((a) => PROPERTY_AMENITY_LABELS[a])
                      .join(", ")
                  : "None"}
              </dd>
            </div>
            <div>
              <dt className="font-bold">Photos</dt>
              <dd>{values.photos.length} uploaded</dd>
            </div>
            <div>
              <dt className="font-bold">Pricing</dt>
              <dd>
                Rate ₦{values.negotiatedLandlordRateNgn} · Outright ₦
                {values.outrightPriceNgn} · Installment ₦
                {values.installmentBasePriceNgn}
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(4)}>
              Back
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !canProceedFromMedia}
            >
              {submitting
                ? "Submitting..."
                : submitLabel ?? (mode === "edit" ? "Save changes" : "Submit listing")}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
