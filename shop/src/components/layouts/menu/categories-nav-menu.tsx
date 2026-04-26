import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import cn from 'classnames';
import Link from '@/components/ui/link';
import Scrollbar from '@/components/ui/scrollbar';
import { ArrowDownIcon } from '@/components/icons/arrow-down';
import { useCategoryRoots } from '@/framework/category';
import { Routes } from '@/config/routes';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

interface CategoriesNavMenuProps {
  /** `colored` (default) — accented border used in the main header.
   *  `minimal` — plain border used in slim / mega-menu headers. */
  variant?: 'colored' | 'minimal';
}

/**
 * Top-navigation categories dropdown.
 *
 * Fetches root-level categories from `GET /categories/roots` and renders
 * them as a Headless UI `Menu` dropdown. Clicking a category navigates to
 * `/products?categories={slug}` so the product listing picks up the filter
 * automatically via `formatProductsArgs`.
 *
 * Replaces the legacy `GroupsDropdownMenu` (which used the stubbed `useTypes`
 * Pickbazar concept that has no equivalent in Kolshi).
 */
const CategoriesNavMenu: React.FC<CategoriesNavMenuProps> = ({
  variant = 'colored',
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { roots, isLoading } = useCategoryRoots();

  const activeCategory = roots.find(
    (c) => router.query.categories === c.slug,
  );
  const label = activeCategory?.name ?? t('text-all-categories', { defaultValue: 'All Categories' });

  if (isLoading) {
    return (
      <div className="flex h-11 min-w-[150px] animate-pulse items-center rounded border border-border-200 bg-gray-100 px-4 xl:min-w-[160px]" />
    );
  }

  if (!roots.length) return null;

  return (
    <Menu as="div" className="relative inline-block ltr:text-left rtl:text-right">
      <Menu.Button
        className={cn(
          'flex h-11 shrink-0 items-center text-sm font-semibold text-heading focus:outline-0',
          {
            'min-w-[150px] rounded border border-border-200 bg-light px-4 xl:min-w-[160px] xl:text-accent xl:text-[15px]':
              variant === 'colored',
            'rounded-lg border border-border-200 bg-gray-50 px-3 md:text-[15px]':
              variant === 'minimal',
          },
        )}
      >
        {({ open }) => (
          <>
            <span className="flex-1 whitespace-nowrap ltr:text-left rtl:text-right">
              {label}
            </span>
            <span className="flex pt-1 ltr:ml-2.5 rtl:mr-2.5">
              <ArrowDownIcon
                className={cn('h-3 w-3 transition-transform duration-200', {
                  'rotate-180': open,
                })}
              />
            </span>
          </>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          as="div"
          className="absolute z-30 mt-2 h-56 max-h-56 min-h-40 w-52 overflow-hidden rounded bg-light py-2 shadow-700 focus:outline-none sm:max-h-72 2xl:h-auto 2xl:max-h-screen ltr:left-0 ltr:origin-top-left rtl:right-0 rtl:origin-top-right"
        >
          <Scrollbar
            className="h-full w-full"
            options={{ scrollbars: { autoHide: 'never' } }}
          >
            {/* "All" option — clears the category filter */}
            <Menu.Item>
              {({ active, close }) => (
                <Link
                  href={Routes.products}
                  className={cn(
                    'flex w-full items-center px-5 py-2.5 text-sm font-semibold capitalize transition duration-200 hover:text-accent focus:outline-0',
                    active || !activeCategory ? 'text-accent' : 'text-body-dark',
                  )}
                  onClick={close}
                >
                  {t('text-all-categories', { defaultValue: 'All Categories' })}
                </Link>
              )}
            </Menu.Item>

            {roots.map((category) => (
              <Menu.Item key={category.id}>
                {({ active, close }) => (
                  <Link
                    href={{
                      pathname: Routes.products,
                      query: { categories: category.slug },
                    }}
                    className={cn(
                      'flex w-full items-center px-5 py-2.5 text-sm font-semibold capitalize transition duration-200 hover:text-accent focus:outline-0',
                      active || activeCategory?.id === category.id
                        ? 'text-accent'
                        : 'text-body-dark',
                    )}
                    onClick={close}
                  >
                    {category.name}
                  </Link>
                )}
              </Menu.Item>
            ))}
          </Scrollbar>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default CategoriesNavMenu;
