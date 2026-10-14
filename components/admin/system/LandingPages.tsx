"use client";

import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  HowToUseCard,
  LandingPage,
  useCreateLandingPage,
  useDeleteLandingPage,
  useLandingPages,
  useUpdateLandingPage,
} from "@/hooks/useLandingPages";
import { Product, useProducts } from "@/hooks/useShopData";
import {
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Layers,
  Package,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

// Safe slug generator that works with English and fallback for Bengali/Unicode titles
const generateSlug = (title: string) => {
  const clean = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || `lp-${Date.now().toString(36)}`;
};

const emptyForm = (): Omit<
  LandingPage,
  "id" | "created_at" | "updated_at"
> => ({
  title: "",
  slug: "",
  is_active: true,
  hero_title: "",
  hero_subtitle: "",
  hero_image: "",
  hero_cta_text: "অর্ডার করতে চাই",
  product_ids: [],
  how_to_use_cards: [],
  show_reviews: true,
});

export default function AdminLandingPages() {
  const { data: pages = [], isLoading } = useLandingPages();
  const { data: allProducts = [] } = useProducts();
  const createPage = useCreateLandingPage();
  const updatePage = useUpdateLandingPage();
  const deletePage = useDeleteLandingPage();

  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [productSearch, setProductSearch] = useState("");

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setProductSearch("");
    setIsOpen(true);
  };

  const openEdit = (p: LandingPage) => {
    setEditId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      is_active: p.is_active,
      hero_title: p.hero_title,
      hero_subtitle: p.hero_subtitle || "",
      hero_image: p.hero_image || "",
      hero_cta_text: p.hero_cta_text || "অর্ডার করতে চাই",
      product_ids: p.product_ids || [],
      how_to_use_cards: p.how_to_use_cards || [],
      show_reviews: p.show_reviews,
    });
    setProductSearch("");
    setIsOpen(true);
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: editId ? prev.slug : generateSlug(title),
    }));
  };

  // Select product (with auto-fill intelligent defaults for title, hero, and image)
  const selectProduct = (product: Product) => {
    setForm((prev) => {
      const alreadyHas = prev.product_ids.includes(product.id);
      let updatedIds = [product.id];
      if (alreadyHas) {
        // Toggle off if already sole selection
        if (prev.product_ids.length === 1) {
          return { ...prev, product_ids: [] };
        }
        updatedIds = prev.product_ids.filter((id) => id !== product.id);
      } else {
        // Replace or set as main
        updatedIds = [product.id, ...prev.product_ids.filter((id) => id !== product.id)].slice(0, 5);
      }

      return {
        ...prev,
        product_ids: updatedIds,
        title: prev.title || product.name,
        hero_title: prev.hero_title || `${product.name} - বিশেষ মূল্যছাড় অফার!`,
        hero_subtitle:
          prev.hero_subtitle ||
          product.short_description ||
          "সীমিত সময়ের জন্য ১০০% আসল প্রোডাক্টে আকর্ষণীয় ছাড় ও ক্যাশ অন ডেলিভারি।",
        hero_image: prev.hero_image || product.images?.[0] || "",
        slug: prev.slug || generateSlug(product.name),
      };
    });

    toast.success(`"${product.name}" প্রোডাক্টটি নির্বাচিত হয়েছে`);
  };

  const removeSelectedProduct = (id: string) => {
    setForm((prev) => ({
      ...prev,
      product_ids: prev.product_ids.filter((p) => p !== id),
    }));
  };

  const addHowToCard = () => {
    setForm((prev) => ({
      ...prev,
      how_to_use_cards: [
        ...prev.how_to_use_cards,
        { image: "", title: "", description: "" },
      ],
    }));
  };

  const updateHowToCard = (
    index: number,
    field: keyof HowToUseCard,
    value: string,
  ) => {
    setForm((prev) => {
      const cards = [...prev.how_to_use_cards];
      cards[index] = { ...cards[index], [field]: value };
      return { ...prev, how_to_use_cards: cards };
    });
  };

  const removeHowToCard = (index: number) => {
    setForm((prev) => ({
      ...prev,
      how_to_use_cards: prev.how_to_use_cards.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("পেজের শিরোনাম (Page Title) প্রদান করুন");
      return;
    }
    if (!form.hero_title.trim()) {
      toast.error("হিরো টাইটেল (Hero Title) প্রদান করুন");
      return;
    }

    // Auto-generate or sanitize slug
    let finalSlug = form.slug.trim();
    if (!finalSlug) {
      finalSlug = generateSlug(form.title);
    } else {
      finalSlug = finalSlug
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_-]+/g, "-");
    }

    if (form.product_ids.length === 0) {
      toast.error("কমপক্ষে ১টি প্রোডাক্ট নির্বাচন করুন (Select at least one product)");
      return;
    }

    const payload = {
      ...form,
      slug: finalSlug,
    };

    try {
      if (editId) {
        await updatePage.mutateAsync({ id: editId, ...payload });
      } else {
        await createPage.mutateAsync(payload);
      }
      setIsOpen(false);
    } catch (e: any) {
      // toast error handled in hook
    }
  };

  const copyUrl = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/lp/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("ল্যান্ডিং পেজের লিংক কপি করা হয়েছে!", {
      description: url,
    });
  };

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return allProducts;
    const q = productSearch.toLowerCase().trim();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q)),
    );
  }, [allProducts, productSearch]);

  // Selected products details
  const selectedProductsList = useMemo(() => {
    const map = new Map(allProducts.map((p) => [p.id, p]));
    return form.product_ids
      .map((id) => map.get(id))
      .filter((p): p is (typeof allProducts)[number] => Boolean(p));
  }, [allProducts, form.product_ids]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            Landing Pages (ল্যান্ডিং পেজসমূহ)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            একটি নির্দিষ্ট প্রোডাক্টের জন্য আকর্ষণীয় সিঙ্গেল-প্রোডাক্ট সেলস ফানেল ল্যান্ডিং পেজ তৈরি করুন
          </p>
        </div>
        <Button onClick={openCreate} className="btn-accent shadow-md shadow-accent/20">
          <Plus className="h-4 w-4 mr-2" /> নতুন ল্যান্ডিং পেজ তৈরি করুন
        </Button>
      </div>

      {/* Pages List */}
      {pages.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-3xl p-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-foreground mb-1">
            এখনও কোনো ল্যান্ডিং পেজ তৈরি করা হয়নি
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            আপনার কোনো প্রোডাক্টের বিজ্ঞাপন বা ক্যাম্পেইনের জন্য হাই-কনভার্টিং ল্যান্ডিং পেজ তৈরি করে দ্রুত সেল বৃদ্ধি করুন।
          </p>
          <Button onClick={openCreate} className="btn-accent">
            <Plus className="h-4 w-4 mr-2" /> প্রথম ল্যান্ডিং পেজ তৈরি করুন
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-accent/40 transition-all shadow-xs"
            >
              {page.hero_image ? (
                <div className="w-24 h-16 rounded-xl overflow-hidden bg-secondary shrink-0 border border-border relative">
                  <Image
                    src={page.hero_image}
                    alt={page.hero_title || page.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-16 rounded-xl bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0 border border-border text-xs">
                  No Image
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-base text-foreground truncate">
                    {page.title}
                  </h3>
                  <Badge variant={page.is_active ? "default" : "secondary"} className="text-[10px]">
                    {page.is_active ? "সচল (Active)" : "খসড়া (Draft)"}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono text-accent">/lp/{page.slug}</span>
                  <span>•</span>
                  <span>{page.product_ids?.length || 0} টি প্রোডাক্ট</span>
                  {page.hero_title && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[200px]">{page.hero_title}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyUrl(page.slug)}
                  title="Copy Link"
                  className="text-xs"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  লিংক কপি
                </Button>

                <a
                  href={`/lp/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="text-xs">
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    দেখুন
                  </Button>
                </a>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(page)}
                  className="text-xs"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  এডিট
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        "{page.title}" ল্যান্ডিং পেজটি মুছে ফেলতে চান?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        এই কাজটি সম্পন্ন হলে পেজটি আর পুনরুদ্ধার করা যাবে না।
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>বাতিল</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deletePage.mutate(page.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        ডিলিট করুন
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              {editId ? "ল্যান্ডিং পেজ সম্পাদনা (Edit Landing Page)" : "নতুন ল্যান্ডিং পেজ তৈরি (Create Landing Page)"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* Step 1: Product Selection (Primary Action) */}
            <div className="space-y-3 p-5 rounded-2xl bg-secondary/40 border-2 border-accent/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4 text-accent" />
                    ১. যে প্রোডাক্টটির জন্য ল্যান্ডিং পেজ তৈরি করবেন তা সিলেক্ট করুন *
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    প্রোডাক্ট সিলেক্ট করলে স্বয়ংক্রিয়ভাবে টাইটেল, ব্যানার এবং ছবি সেট হয়ে যাবে
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-muted-foreground" />
                  <Input
                    placeholder="প্রোডাক্ট খুঁজুন..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="h-9 pl-8 text-xs rounded-xl bg-card"
                  />
                </div>
              </div>

              {/* Selected Product Banner */}
              {selectedProductsList.length > 0 && (
                <div className="bg-card p-3.5 rounded-xl border border-accent/50 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0 relative border border-border">
                      {selectedProductsList[0]?.images?.[0] ? (
                        <Image
                          src={selectedProductsList[0].images[0]}
                          alt={selectedProductsList[0].name}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        মূল প্রোডাক্ট: {selectedProductsList[0]?.name}
                      </p>
                      <p className="text-xs font-bold text-accent">
                        মূল্য: ৳{selectedProductsList[0]?.sale_price ?? selectedProductsList[0]?.price}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full shrink-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> সিলেক্টেড
                  </span>
                </div>
              )}

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto border border-border rounded-xl p-3 bg-card">
                {filteredProducts.map((product) => {
                  const isChecked = form.product_ids.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => selectProduct(product)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer border transition-all ${
                        isChecked
                          ? "border-accent bg-accent/10 shadow-xs ring-1 ring-accent"
                          : "border-border/60 hover:bg-secondary/60"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0 relative border border-border/80">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate text-foreground">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-accent font-semibold">
                          ৳{product.sale_price ?? product.price}
                        </p>
                      </div>
                      {isChecked && (
                        <Check className="w-4 h-4 text-accent stroke-[3] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Page & Banner Info */}
            <div className="space-y-4 p-5 rounded-2xl bg-secondary/30 border border-border">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                ২. ব্যানার ও পেজ সেটিংস (Page & Banner Settings)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    পেজের শিরোনাম (Page Title) *
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="যেমন: সানগ্লাস ধামাকা অফার"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    ইউআরএল স্ল্যাগ (URL Slug) *
                  </label>
                  <Input
                    value={form.slug}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-"),
                      }))
                    }
                    placeholder="sunglass-offer"
                    className="h-10 rounded-xl font-mono text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    লাইভ লিংক হবে: <span className="text-accent font-semibold">/lp/{form.slug || "..."}</span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  প্রধান হিরো টাইটেল (Hero Title) *
                </label>
                <Input
                  value={form.hero_title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, hero_title: e.target.value }))
                  }
                  placeholder="যেমন: প্রিমিয়াম সানগ্লাসে আকর্ষণীয় ডিসকাউন্ট!"
                  className="h-10 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  উপ-শিরোনাম (Hero Subtitle)
                </label>
                <Input
                  value={form.hero_subtitle || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      hero_subtitle: e.target.value,
                    }))
                  }
                  placeholder="যেমন: ১০০% আসল ও ট্রেন্ডি কালেকশন, সারা দেশে ফ্রি ডেলিভারি"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    ব্যানার ইমেজ (Hero Image - ঐচ্ছিক)
                  </label>
                  <ImageUpload
                    value={form.hero_image || ""}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, hero_image: v }))
                    }
                    folder="landing-pages"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    অর্ডার বাটন টেক্সট (CTA Text)
                  </label>
                  <Input
                    value={form.hero_cta_text}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        hero_cta_text: e.target.value,
                      }))
                    }
                    placeholder="অর্ডার করতে চাই"
                    className="h-10 rounded-xl"
                  />
                  <div className="flex items-center gap-2.5 pt-4">
                    <Switch
                      checked={form.is_active}
                      onCheckedChange={(v) =>
                        setForm((prev) => ({ ...prev, is_active: v }))
                      }
                    />
                    <span className="text-xs font-semibold text-foreground">
                      পেজটি একটিভ থাকবে (Live Active)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: How to Use / Feature Cards */}
            <div className="space-y-3 p-5 rounded-2xl bg-secondary/30 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    ৩. ফিচার বা ব্যবহারের নিয়মাবলী (ঐচ্ছিক)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    পণ্যটির গুণাবলী বা ধাপসমূহ প্রদর্শনের জন্য কার্ড যুক্ত করতে পারেন
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addHowToCard}
                  className="text-xs rounded-xl"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> কার্ড যোগ করুন
                </Button>
              </div>

              {form.how_to_use_cards.map((card, i) => (
                <div
                  key={i}
                  className="border border-border rounded-2xl p-4 space-y-3 relative bg-card shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => removeHowToCard(i)}
                    className="absolute top-3 right-3 text-destructive hover:bg-destructive/10 p-1 rounded-md"
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-accent/10 text-accent mb-1">
                    ধাপ #{i + 1}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        কার্ড শিরোনাম (Title)
                      </label>
                      <Input
                        value={card.title}
                        onChange={(e) =>
                          updateHowToCard(i, "title", e.target.value)
                        }
                        placeholder="যেমন: ১. ১০০% ইউভি প্রোটেকশন"
                        className="h-9 text-xs rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        কার্ড ইমেজ (Image)
                      </label>
                      <ImageUpload
                        value={card.image}
                        onChange={(v) => updateHowToCard(i, "image", v)}
                        folder="landing-pages"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      বিস্তারিত বিবরণ (Description)
                    </label>
                    <textarea
                      value={card.description}
                      onChange={(e) =>
                        updateHowToCard(i, "description", e.target.value)
                      }
                      placeholder="পণ্যটির বিশেষত্ব সম্পর্কে সংক্ষেপে লিখুন..."
                      className="input-shop min-h-[60px] text-xs rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Step 4: Reviews Setting */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border">
              <div>
                <p className="text-xs font-bold text-foreground">
                  কাস্টমার রিভিউ সেকশন দেখান (Show Reviews Section)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  ল্যান্ডিং পেজে সন্তুষ্ট গ্রাহকদের রিভিউ ও রেটিং প্রদর্শিত হবে
                </p>
              </div>
              <Switch
                checked={form.show_reviews}
                onCheckedChange={(v) =>
                  setForm((prev) => ({ ...prev, show_reviews: v }))
                }
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                বাতিল
              </Button>
              <Button
                onClick={handleSave}
                className="btn-accent px-8 font-bold shadow-md shadow-accent/20"
                disabled={createPage.isPending || updatePage.isPending}
              >
                {createPage.isPending || updatePage.isPending ? (
                  "সংরক্ষণ হচ্ছে..."
                ) : editId ? (
                  "আপডেট করুন (Update)"
                ) : (
                  "তৈরি করুন (Create)"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
