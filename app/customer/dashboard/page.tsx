
"use client"
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/dashboardnavbar';
import Footer from '@/components/Footer';
import type { ServiceCatalogApiResponse } from '@/types/service-catalog';

const MOBILE_SPANS = [
  'col-span-2',
  'col-span-2',
  'col-span-1',
  'col-span-2',
  'col-span-1',
  'col-span-1',
  'col-span-1',
  'col-span-1',
  'col-span-1',
];

const fallbackMobileCategories = [
  { name: "AC Repair", span: "col-span-2" },
  { name: "Home Cleaning", span: "col-span-2" },
  { name: "Salon", span: "col-span-1" },
  { name: "Electrician", span: "col-span-2" },
  { name: "Plumbing", span: "col-span-1" },
  { name: "Painting", span: "col-span-1" },
  { name: "Pest Control", span: "col-span-1" },
  { name: "Appliance Repair", span: "col-span-1" },
  { name: "Massage", span: "col-span-1" },
];

type Product = {
  id: string;
  categorySlug: string;
  name: string;
  currentPrice: string;
  originalPrice: string;
  image: string;
  deliveryTime: string;
};

function toProductCard(service: {
  id: string;
  categorySlug: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  deliveryTime: string | null;
}): Product {
  return {
    id: service.id,
    categorySlug: service.categorySlug,
    name: service.name,
    currentPrice: `₹${Math.round(service.price)}`,
    originalPrice: `₹${Math.round(service.originalPrice ?? service.price * 1.3)}`,
    image: service.image,
    deliveryTime: service.deliveryTime ?? "30 MINS",
  };
}

function renderPrice(price: string) {
  const numericPart = price.replace(/^₹/, '');
  return (
    <>
      <span className="font-sans">₹</span>
      {numericPart}
    </>
  );
}

function ProductListingSection({
  title,
  products,
  onOpenService,
  onSeeAll,
}: {
  title: string;
  products: Product[];
  onOpenService: (product: Product) => void;
  onSeeAll: () => void;
}) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[26px] font-extrabold tracking-tight text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={onSeeAll}
          className="text-[22px] font-bold text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
        >
          See All ›
        </button>
      </div>

      <div className="-mx-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-px-4">
        <div className="flex min-w-max gap-3 px-1 pb-2">
          {products.map((product, index) => (
            <article
              key={`${title}-${index}`}
              onClick={() => onOpenService(product)}
              className="w-[170px] rounded-2xl bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.06)] cursor-pointer"
            >
              <div className="relative mb-3 rounded-xl bg-gray-50 p-2">
                <button
                  type="button"
                  aria-label="Add product"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenService(product);
                  }}
                  className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-[#2563eb] bg-white text-2xl font-bold leading-none text-[#2563eb] shadow-sm"
                >
                  +
                </button>
                <div className="relative h-[120px] w-full overflow-hidden rounded-lg">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
              </div>

              <p className="text-[12px] font-extrabold tracking-wide text-gray-500">{product.deliveryTime}</p>
              <h4 className="mt-1 text-[17px] font-semibold leading-5 text-gray-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                {product.name}
              </h4>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[14px] font-extrabold text-gray-900 leading-none">{renderPrice(product.currentPrice)}</span>
                <span className="text-[14px] text-gray-400 line-through leading-none">{renderPrice(product.originalPrice)}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<ServiceCatalogApiResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    const CATALOG_CACHE_KEY = 'sevam_catalog_cache_v1';

    // Try localStorage cache first for instant display
    try {
      const raw = localStorage.getItem(CATALOG_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as ServiceCatalogApiResponse;
        if (cached?.categories?.length > 0) {
          setCatalog(cached);
        }
      }
    } catch {
      localStorage.removeItem(CATALOG_CACHE_KEY);
    }

    const loadCatalog = async () => {
      try {
        const response = await fetch('/api/services/catalog', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Catalog request failed');
        }

        const data = (await response.json()) as ServiceCatalogApiResponse;
        if (!isMounted) return;

        // Only update if different to prevent flash
        setCatalog((prev) => {
          if (prev?.categories?.length === data.categories?.length && prev) {
            return prev;
          }
          // Update cache in background
          localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(data));
          return data;
        });
      } catch {
        // Keep cached data on error
        if (isMounted && !catalog) {
          setCatalog(null);
        }
      }
    };

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const categoryList = catalog?.categories ?? [];
    return categoryList.slice(0, 10).map((category) => category.name.replace(/\s+/g, '\n'));
  }, [catalog]);

  const serviceImages = useMemo(() => {
    const categoryList = catalog?.categories ?? [];
    return categoryList
      .slice(0, 10)
      .map((category) => category.services[0]?.image)
      .filter((image): image is string => Boolean(image));
  }, [catalog]);

  const mobileCategories = useMemo(() => {
    const categoryList = catalog?.categories ?? [];
    if (categoryList.length === 0) {
      return fallbackMobileCategories;
    }

    return categoryList.slice(0, 9).map((category, index) => ({
      name: category.name,
      span: MOBILE_SPANS[index] ?? 'col-span-1',
    }));
  }, [catalog]);

  const allServices = useMemo(
    () =>
      (catalog?.categories ?? []).flatMap((category) =>
        category.services.map((service) => ({
          ...service,
          categorySlug: category.slug,
        }))
      ),
    [catalog]
  );

  const priceDropProducts = useMemo(
    () => allServices.slice(0, 7).map(toProductCard),
    [allServices]
  );

  const priceDropAlertProducts = useMemo(
    () => allServices.slice(7, 14).map(toProductCard),
    [allServices]
  );

  const renderServiceImages = serviceImages.length > 0
    ? serviceImages
    : ['/homepage/services/clean.jpg', '/homepage/services/electrician.jpg', '/homepage/services/makeup.jpg', '/homepage/services/massage.jpg'];

  const handleOpenService = (product: Product) => {
    router.push(
      `/customer/services?serviceId=${encodeURIComponent(product.id)}&category=${encodeURIComponent(product.categorySlug)}`
    );
  };

  const handleSeeAll = () => {
    router.push('/customer/services');
  };

  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      <main className="max-w-[1280px] mx-auto px-4 lg:px-12 py-4 md:py-8">
        {/* Desktop Content */}
        <div className="hidden lg:block">
        {/* Hero Banner with Background Image */}
        <div className="w-full h-[260px] rounded-2xl p-10 flex items-center relative overflow-hidden mb-8">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/homepage/mainbanner.jpg"
              alt="Home services background"
              fill
              priority
              className="object-cover"
              sizes="1280px"
            />
          </div>
          <div className="z-10 w-2/3">
            <h1 className="text-gray-800 text-[44px] font-extrabold leading-[1.1] mb-4 tracking-tight drop-shadow-sm">
              India&#39;s #1 Home Services Platform
            </h1>
            <p className="text-white text-[22px] mb-8 font-medium drop-shadow-sm">
              Your Home, Perfectly Serviced<br/>From expert repairs to luxury spa treatments —<br/>Book trusted professionals in 60 seconds.
            </p>
            <button
              onClick={() => router.push('/customer/services')}
              className="bg-white text-black px-6 py-3 rounded-lg font-bold text-[16px] hover:bg-gray-100 transition-colors shadow-lg"
            >
              Book Service Now
            </button>
          </div>
        </div>

        {/* Promo Banners */}
        <div className="grid grid-cols-3 gap-1 mb-10">
          {/* Promo 1 - Labour */}
          <div className="h-[210px] w-full rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            {/* Background Image */}
            <Image
              src="/homepage/services/subbanner1.png"
              alt="Labour services"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
            <div className="z-10">
              <h2 className="text-white text-[28px] font-extrabold leading-[1.1] mb-2 tracking-tight drop-shadow-md">Labour at your<br/>doorsteps !</h2>
              <p className="text-white text-[15px] font-medium drop-shadow-sm">Masons, painters, movers & more</p>
            </div>
            <button
              onClick={() => router.push('/customer/services?category=labour')}
              className="bg-[#333] text-white px-5 py-2.5 rounded-lg font-bold w-max text-[14px] z-10 hover:bg-black transition-colors shadow-lg"
            >
              Explore Services
            </button>
          </div>

          {/* Promo 2 - Chef/Cooking */}
          <div className="h-[210px] w-full rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            {/* Background Image */}
            <Image
              src="/homepage/services/subbanner2.png"
              alt="Chef and cooking services"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
            <div className="z-10">
              <h2 className="text-white text-[28px] font-extrabold leading-[1.1] mb-2 tracking-tight drop-shadow-md">No time to cook ?</h2>
              <p className="text-white text-[15px] font-medium drop-shadow-sm">Hire cooks, eat fresh daily</p>
            </div>
            <button
              onClick={() => router.push('/customer/services?category=chef')}
              className="bg-[#333] text-white px-5 py-2.5 rounded-lg font-bold w-max text-[14px] z-10 hover:bg-black transition-colors shadow-lg"
            >
              Explore Services
            </button>
          </div>

          {/* Promo 3 - Grooming */}
          <div className="h-[210px] w-full rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            {/* Background Image */}
            <Image
              src="/homepage/services/subbanner3.png"
              alt="Grooming services"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
            <div className="z-10">
              <h2 className="text-white text-[28px] font-extrabold leading-[1.1] mb-2 tracking-tight drop-shadow-md">Self care at home !</h2>
              <p className="text-white text-[15px] font-medium drop-shadow-sm">Haircut, skincare, grooming etc</p>
            </div>
            <button
              onClick={() => router.push('/customer/services?category=grooming')}
              className="bg-[#333] text-white px-5 py-2.5 rounded-lg font-bold w-max text-[14px] z-10 hover:bg-black transition-colors shadow-lg"
            >
              Explore Services
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <h3 className="mb-4 text-[24px] font-extrabold tracking-tight text-gray-900">Services:</h3>
        <div className="grid grid-cols-10 gap-x-4 gap-y-8">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => router.push('/customer/services')}
            >
              <div className="w-full aspect-square rounded-2xl bg-[#f3f6f8] mb-3 group-hover:shadow-md transition-all duration-200 overflow-hidden relative">
                <Image
                  src={renderServiceImages[i % renderServiceImages.length]}
                  alt={cat.replace('\n', ' ')}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <span className="text-[14px] font-semibold text-gray-800 text-center leading-[1.2] whitespace-pre-wrap">
                {cat}
              </span>
            </div>
          ))}
        </div>
        </div>

        {/* Mobile Content */}
        <div className="lg:hidden mt-2">
          <h2 className="text-[22px] font-extrabold text-gray-900 mb-4 tracking-tight">Browse by Category</h2>
          <div className="grid grid-cols-4 gap-3">
            {mobileCategories.map((cat, i) => (
              <div
                key={i}
                className={`flex flex-col items-center cursor-pointer ${cat.span}`}
                onClick={() => router.push('/customer/services')}
              >
                <div className="w-full h-[100px] bg-[#eef6f4] rounded-2xl mb-2 flex items-center justify-center overflow-hidden">
                  <div className="w-1/2 h-1/2 bg-[#d8e8e4] rounded-lg"></div>
                </div>
                <span className="text-[13px] font-bold text-gray-800 text-center leading-[1.2] whitespace-pre-wrap">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {priceDropProducts.length > 0 && (
          <ProductListingSection title="Most booked services" products={priceDropProducts} onOpenService={handleOpenService} onSeeAll={handleSeeAll} />
        )}
        {priceDropAlertProducts.length > 0 && (
          <ProductListingSection title="Price Drop Alert!" products={priceDropAlertProducts} onOpenService={handleOpenService} onSeeAll={handleSeeAll} />
        )}

        <section className="mt-12">
          <Image
            src="/homepage/refer.jpeg"
            alt="Refer banner"
            width={1600}
            height={700}
            className="w-full h-auto object-contain"
            priority={false}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}