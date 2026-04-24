import SectionBlock from '@/components/ui/section-block';
import FilterBar from './filter-bar';
import Categories from '@/components/categories/categories';
import CallToAction from '@/components/cta/call-to-action';
import GroupProducts from '@/components/products/group-products';
import PopularProductsGrid from '@/components/products/popular-products';
import Banner from '@/components/banners/banner';
import type { HomePageProps } from '@/types';
import ProductGridHome from '@/components/products/grids/home';
import BestSellingProductsGrid from '@/components/products/best-selling-products';

/**
 * Kolshi S6 — compact home layout.
 *
 * `TopAuthorsGrid` and `TopManufacturersGrid` are removed; Kolshi has no
 * authors / manufacturers APIs (decision log D.7 / D.8 Delete). The
 * `layoutSettings.authors` / `layoutSettings.manufactures` enable flags
 * are therefore ignored — admin templates that still set them will just
 * render nothing here until the setting is cleaned up.
 */
export default function CompactLayout({ variables }: HomePageProps) {
  return (
    <div className="flex flex-col flex-1 bg-white">
      <FilterBar
        className="top-16 lg:hidden"
        variables={variables.categories}
      />
      <main className="block w-full mt-20 sm:mt-24 lg:mt-6 xl:overflow-hidden">
        <SectionBlock>
          <Banner layout="compact" variables={variables.types} />
        </SectionBlock>
        {variables?.layoutSettings?.bestSelling?.enable ? (
          <BestSellingProductsGrid
            variables={variables?.bestSellingProducts}
            title={variables?.layoutSettings?.bestSelling?.title}
          />
        ) : (
          ''
        )}
        {variables?.layoutSettings?.popularProducts?.enable ? (
          <PopularProductsGrid
            variables={variables.popularProducts}
            title={variables?.layoutSettings?.popularProducts?.title}
          />
        ) : (
          ''
        )}
        {variables?.layoutSettings?.category?.enable ? (
          <Categories
            title={variables?.layoutSettings?.category?.title}
            layout="compact"
            variables={variables.categories}
          />
        ) : (
          ''
        )}
        {variables?.layoutSettings?.handpickedProducts?.enable ? (
          <GroupProducts
            products={variables?.layoutSettings?.handpickedProducts?.products}
            title={variables?.layoutSettings?.handpickedProducts?.title}
            isSlider={
              variables?.layoutSettings?.handpickedProducts?.enableSlider
            }
          />
        ) : (
          ''
        )}
        {variables?.layoutSettings?.newArrival?.enable ? (
          <SectionBlock title={variables?.layoutSettings?.newArrival?.title}>
            <ProductGridHome
              column="five"
              variables={{
                ...variables.products,
                sortedBy: 'DESC',
                orderBy: 'created_at',
              }}
            />
          </SectionBlock>
        ) : (
          ''
        )}
        <CallToAction />
      </main>
    </div>
  );
}
