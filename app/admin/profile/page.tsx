"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createBrowserClient } from "@supabase/ssr";
import { cn } from "@/lib/utils";
import { Save, Upload, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  about_me: z.string().min(1, "About me is required"),
  email: z.string().email("Valid email is required"),
  github_url: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  linkedin_url: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  resume_url: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  profile_image_url: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Profile extends ProfileFormData {
  id: string;
  is_active: boolean;
}

export default function AdminProfilePage() {
  const [loading, setLoading] = React.useState(false);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      title: "",
      about_me: "",
      email: "",
      github_url: "",
      linkedin_url: "",
      resume_url: "",
      profile_image_url: "",
      location: "",
      phone: "",
    },
  });

  const watchedImageUrl = watch("profile_image_url");

  React.useEffect(() => {
    if (watchedImageUrl) {
      setImagePreview(watchedImageUrl);
    }
  }, [watchedImageUrl]);

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/admin/profile");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setProfile(data);
          reset({
            name: data.name || "",
            title: data.title || "",
            about_me: data.about_me || "",
            email: data.email || "",
            github_url: data.github_url || "",
            linkedin_url: data.linkedin_url || "",
            resume_url: data.resume_url || "",
            profile_image_url: data.profile_image_url || "",
            location: data.location || "",
            phone: data.phone || "",
          });
          if (data.profile_image_url) {
            setImagePreview(data.profile_image_url);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fileName = `profile-${Date.now()}.${file.name.split(".").pop()}`;

    const { error } = await supabase.storage
      .from("profile_images")
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast.error("Failed to upload image");
      return;
    }

    const { data: urlData } = supabase.storage.from("profile_images").getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;
    setValue("profile_image_url", publicUrl, { shouldDirty: true });
    setImagePreview(publicUrl);
    toast.success("Image uploaded!");
  };

  const onSubmit = async (formData: ProfileFormData) => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }

      toast.success("Profile saved successfully!");
      fetchProfile(); // Refresh data
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Profile Settings</h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Manage your portfolio profile information
          </p>
        </div>
        {isDirty && (
          <span className="text-sm text-yellow-400">Unsaved changes</span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Image */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white">Profile Image</h2>
          <div className="mt-4 flex items-center gap-6">
            <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-white/[0.08]">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/[0.05]">
                  <span className="text-2xl font-bold text-[var(--color-text-muted)]">
                    {watch("name")?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg bg-white/[0.08] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/[0.12]"
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </button>
              <p className="text-xs text-[var(--color-text-muted)]">
                Max 5MB • PNG, JPG, WebP
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white">Basic Information</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Full Name *</label>
              <input
                {...register("name")}
                className={cn(
                  "w-full rounded-lg border bg-white/[0.04] px-4 py-2.5 text-sm text-white",
                  "border-white/[0.08] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50",
                  errors.name ? "border-red-500" : ""
                )}
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Title / Role *</label>
              <input
                {...register("title")}
                placeholder="e.g. AI & ML Engineer"
                className={cn(
                  "w-full rounded-lg border bg-white/[0.04] px-4 py-2.5 text-sm text-white",
                  "border-white/[0.08] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50",
                  errors.title ? "border-red-500" : ""
                )}
              />
              {errors.title && (
                <p className="text-xs text-red-400">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Email *</label>
              <input
                {...register("email")}
                type="email"
                className={cn(
                  "w-full rounded-lg border bg-white/[0.04] px-4 py-2.5 text-sm text-white",
                  "border-white/[0.08] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50",
                  errors.email ? "border-red-500" : ""
                )}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Location</label>
              <input
                {...register("location")}
                placeholder="e.g. Hyderabad, India"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Phone</label>
              <input
                {...register("phone")}
                placeholder="Optional phone number"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
              />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <label className="text-sm font-medium text-white/80">About Me *</label>
            <textarea
              {...register("about_me")}
              rows={5}
              placeholder="Write a compelling bio about yourself..."
              className={cn(
                "w-full rounded-lg border bg-white/[0.04] px-4 py-2.5 text-sm text-white",
                "border-white/[0.08] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50",
                "resize-none",
                errors.about_me ? "border-red-500" : ""
              )}
            />
            {errors.about_me && (
              <p className="text-xs text-red-400">{errors.about_me.message}</p>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white">Social Links</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">GitHub URL</label>
              <input
                {...register("github_url")}
                placeholder="https://github.com/username"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
              />
              {errors.github_url && (
                <p className="text-xs text-red-400">{errors.github_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">LinkedIn URL</label>
              <input
                {...register("linkedin_url")}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
              />
              {errors.linkedin_url && (
                <p className="text-xs text-red-400">{errors.linkedin_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Resume URL</label>
              <input
                {...register("resume_url")}
                placeholder="https://example.com/resume.pdf"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Profile Image URL</label>
              <input
                {...register("profile_image_url")}
                placeholder="https://example.com/profile.jpg"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-white/80 transition-all hover:border-white/20 hover:bg-white/[0.05]"
          >
            <Eye className="h-4 w-4" />
            Preview
          </a>
          <button
            type="submit"
            disabled={loading || !isDirty}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-6 py-2.5 text-sm font-medium text-white",
              "transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}