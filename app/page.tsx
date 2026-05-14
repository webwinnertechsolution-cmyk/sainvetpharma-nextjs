import Slider from './components/home/Slider';
import HomeCategories from './components/home/HomeCategories';
import ProductSection from './components/home/ProductSection';
import PromotionalBanner from './components/home/PromotionalBanner';
import ExclusiveOffers from './components/home/ExclusiveOffers';
import VideoSection from './components/home/VideoSection';
import BlogSection from './components/home/BlogSection';
import BrandsSection from './components/home/BrandsSection';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAllData() {
  // ✅ 9 items — 9 variables
  const [
    sliders,
    categories,
    section1Res,
    products1,
    section2Res,
    products2,
    blogs,
    brandSection,
    brands,
  ] = await Promise.all([
    fetch(`${API_URL}/api/sliders`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => []),
    fetch(`${API_URL}/api/home-categories`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => []),
    fetch(`${API_URL}/api/product-sections/1`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => null),
    fetch(`${API_URL}/api/product-sections/1/products`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => []),
    fetch(`${API_URL}/api/product-sections/2`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => null),
    fetch(`${API_URL}/api/product-sections/2/products`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => []),
    fetch(`${API_URL}/api/blogs/latest`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => []),
    fetch(`${API_URL}/api/brand-section`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => null),
    fetch(`${API_URL}/api/brands`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => []),
  ]);

  return {
    sliders,
    categories,
    section1: section1Res,
    products1,
    section2: section2Res,
    products2,
    blogs,
    brandSection,
    brands,
  };
}

export default async function Home() {
  const {
    sliders, categories,
    section1, products1,
    section2, products2,
    blogs,
    brandSection,
    brands,
  } = await getAllData();

  return (
    <div>
      <Slider sliders={sliders} />
      <HomeCategories categories={categories} />
      <ProductSection section={section1} products={products1} />
      <PromotionalBanner />
      <ProductSection section={section2} products={products2} />
      <ExclusiveOffers />
      <BrandsSection section={brandSection} brands={brands} />
      <VideoSection sectionId={1} />
      <BlogSection blogs={blogs} />
    </div>
  );
}