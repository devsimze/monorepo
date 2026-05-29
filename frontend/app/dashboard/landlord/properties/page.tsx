"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Plus,
  Building2,
  MessageSquare,
  Settings,
  MapPin,
  Bed,
  Bath,
  Square,
  MoreVertical,
  Edit,
  Eye,
  EyeOff,
  RotateCcw,
  Search,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deactivateLandlordProperty,
  listLandlordProperties,
  relistLandlordProperty,
  type LandlordPropertyRecord,
} from "@/lib/landlordPropertiesApi";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

function statusPresentation(status: string) {
  switch (status) {
    case "pending_review":
    case "pending":
      return { label: "Pending Review", className: "bg-accent" };
    case "approved":
    case "active":
      return { label: "Approved", className: "bg-secondary" };
    case "rented":
      return { label: "Rented", className: "bg-primary" };
    case "deactivated":
    case "inactive":
      return { label: "Deactivated", className: "bg-muted" };
    default:
      return { label: status, className: "bg-muted" };
  }
}

function formatLocation(property: LandlordPropertyRecord) {
  return [property.area, property.city].filter(Boolean).join(", ") || property.address;
}

export default function LandlordPropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [properties, setProperties] = useState<LandlordPropertyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadProperties = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const result = await listLandlordProperties({
        query: searchQuery || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setProperties(result.properties);
    } catch (error) {
      setLoadError(true);
      showErrorToast(error, "Failed to load properties");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(loadProperties, 300);
    return () => clearTimeout(timer);
  }, [loadProperties]);

  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties;
    const q = searchQuery.toLowerCase();
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        formatLocation(p).toLowerCase().includes(q),
    );
  }, [properties, searchQuery]);

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateLandlordProperty(id);
      showSuccessToast("Listing deactivated.");
      loadProperties();
    } catch (error) {
      showErrorToast(error, "Failed to deactivate");
    }
  };

  const handleRelist = async (id: string) => {
    try {
      await relistLandlordProperty(id);
      showSuccessToast("Listing submitted for review again.");
      loadProperties();
    } catch (error) {
      showErrorToast(error, "Failed to relist");
    }
  };

  const statusFilters = [
    { value: "all", label: "All" },
    { value: "pending_review", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rented", label: "Rented" },
    { value: "deactivated", label: "Deactivated" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r-3 border-foreground bg-card pt-20">
        <div className="flex h-full flex-col px-4 py-6">
          <div className="mb-8 border-3 border-foreground bg-accent p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <p className="text-sm font-medium text-foreground">Logged in as</p>
            <p className="text-lg font-bold text-foreground">Chief Okonkwo</p>
            <p className="text-sm text-muted-foreground">Landlord</p>
          </div>
          <nav className="flex-1 space-y-2">
            <Link
              href="/dashboard/landlord"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/landlord/properties"
              className="flex items-center gap-3 border-3 border-foreground bg-primary p-3 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <Building2 className="h-5 w-5" />
              My Properties
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted"
            >
              <MessageSquare className="h-5 w-5" />
              Messages
            </Link>
            <Link
              href="/dashboard/landlord/settings"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>
      </aside>

      <main className="ml-64 min-h-screen pt-20">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Properties</h1>
              <p className="mt-1 text-muted-foreground">
                Manage listings, pricing, and availability
              </p>
            </div>
            <Link href="/dashboard/landlord/properties/new">
              <Button className="border-3 border-foreground bg-primary px-6 py-5 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <Plus className="mr-2 h-5 w-5" />
                Add Property
              </Button>
            </Link>
          </div>

          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-3 border-foreground bg-background pl-12 py-5 font-medium"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`border-3 border-foreground px-4 py-2 font-bold ${
                    statusFilter === value
                      ? "bg-foreground text-background"
                      : "bg-card hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={`loading-${index}`} className="border-3 border-foreground p-6">
                  <Skeleton className="h-32 w-full" />
                </Card>
              ))
            ) : loadError ? (
              <Card className="border-3 border-foreground bg-destructive/10 p-12 text-center">
                <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
                <h3 className="mt-4 text-xl font-bold">Properties unavailable</h3>
              </Card>
            ) : filteredProperties.length === 0 ? (
              <Card className="border-3 border-foreground p-12 text-center">
                <Building2 className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-bold">No properties found</h3>
              </Card>
            ) : (
              filteredProperties.map((property) => {
                const { label, className } = statusPresentation(property.status);
                const primaryPhoto =
                  property.photos[property.primaryPhotoIndex ?? 0] ??
                  property.photos[0];
                const canDeactivate =
                  property.status === "approved" ||
                  property.status === "active" ||
                  property.status === "rented";
                const canRelist =
                  property.status === "deactivated" ||
                  property.status === "inactive";

                return (
                  <Card
                    key={property.id}
                    className="border-3 border-foreground p-0 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative h-48 w-full shrink-0 border-b-3 border-foreground bg-muted md:w-72 md:border-b-0 md:border-r-3">
                        {primaryPhoto ? (
                          <Image
                            src={primaryPhoto}
                            alt={property.title}
                            fill
                            className="object-cover"
                            unoptimized={primaryPhoto.startsWith("data:")}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Building2 className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                        <div
                          className={`absolute left-3 top-3 border-2 border-foreground px-3 py-1 text-sm font-bold ${className}`}
                        >
                          {label}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-4 flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-bold">{property.title}</h3>
                            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-4 w-4 shrink-0" />
                              {formatLocation(property)}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="border-3 border-foreground"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="border-3 border-foreground">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/landlord/properties/${property.id}/edit`}
                                  className="flex cursor-pointer items-center"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              {property.listingId && (
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/properties/${property.listingId}`}
                                    className="flex cursor-pointer items-center"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View listing
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              {canDeactivate && (
                                <DropdownMenuItem
                                  onClick={() => handleDeactivate(property.id)}
                                >
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Deactivate
                                </DropdownMenuItem>
                              )}
                              {canRelist && (
                                <DropdownMenuItem
                                  onClick={() => handleRelist(property.id)}
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Relist
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-4 text-sm font-medium">
                          <span className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            {property.bedrooms} beds
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            {property.bathrooms} baths
                          </span>
                          {property.sqm != null && (
                            <span className="flex items-center gap-1">
                              <Square className="h-4 w-4" />
                              {property.sqm} sqm
                            </span>
                          )}
                        </div>

                        <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              ₦
                              {(
                                property.installmentBasePriceNgn ??
                                property.annualRentNgn
                              ).toLocaleString()}
                              <span className="text-sm font-normal text-muted-foreground">
                                {" "}
                                / yr instalment base
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {property.views} views · {property.inquiries} inquiries
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
