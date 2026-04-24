import Scrollbar from '@/components/ui/scrollbar';
import Select from '@/components/ui/select/select';
import { RadioGroup } from '@headlessui/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/lib/locals';
interface Plan {
  id: number | string;
  key: string;
  label: string;
  value: string;
  orderBy: string;
  sortedBy: 'ASC' | 'DESC';
}
/**
 * Sort plans exposed in the shop UI. The `orderBy` / `sortedBy` pair is
 * translated to Kolshi's `sortBy` enum by `mapLegacySort` before the
 * request leaves the axios layer, so the human-readable vocabulary
 * stays in the UI while the wire format is Kolshi-native.
 */
const plans: Plan[] = [
  {
    id: '1',
    key: 'sorting',
    label: 'Newest',
    value: 'created_at',
    orderBy: 'created_at',
    sortedBy: 'DESC',
  },
  {
    id: '2',
    key: 'sorting',
    label: 'Most Popular',
    value: 'popular',
    orderBy: 'popular',
    sortedBy: 'DESC',
  },
  {
    id: '3',
    key: 'sorting',
    label: 'Top Rated',
    value: 'rating',
    orderBy: 'rating',
    sortedBy: 'DESC',
  },
  {
    id: '4',
    key: 'sorting',
    label: 'Sort by Price: Low to High',
    value: 'price',
    orderBy: 'price',
    sortedBy: 'ASC',
  },
  {
    id: '5',
    key: 'sorting',
    label: 'Sort by Price: High to Low',
    value: 'price',
    orderBy: 'price',
    sortedBy: 'DESC',
  },
];

type Props = {
  variant?: 'radio' | 'dropdown';
};

const Sorting: React.FC<Props> = ({ variant = 'radio' }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { isRTL } = useIsRTL();
  const [selected, setSelected] = useState(
    () =>
      plans.find(
        (plan) =>
          plan.orderBy === router.query.orderBy &&
          (!router.query.sortedBy ||
            plan.sortedBy === (router.query.sortedBy as 'ASC' | 'DESC')),
      ) ?? plans[0],
  );

  useEffect(() => {
    if (!router.query.orderBy) {
      setSelected(plans[0]);
    }
  }, [router.query.orderBy]);

  function handleChange(values: Plan) {
    const { orderBy, sortedBy } = values;
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        orderBy,
        sortedBy,
      },
    });
    setSelected(values);
  }

  return (
    <>
      {variant === 'dropdown' && (
        <Select
          defaultValue={selected}
          isRtl={isRTL}
          options={plans}
          isSearchable={false}
          // @ts-ignore
          onChange={handleChange}
        />
      )}
      {variant === 'radio' && (
        <Scrollbar style={{ maxHeight: '400px' }}>
          <RadioGroup value={selected} onChange={handleChange}>
            <RadioGroup.Label className="sr-only">
              {t('text-sort')}
            </RadioGroup.Label>
            <div className="space-y-4">
              {plans.map((plan) => (
                <RadioGroup.Option key={plan.id} value={plan}>
                  {({ checked }) => (
                    <>
                      <div className="flex w-full cursor-pointer items-center">
                        <span
                          className={`h-[18px] w-[18px] rounded-full bg-white ltr:mr-3 rtl:ml-3 ${
                            checked
                              ? 'border-[5px] border-gray-800'
                              : 'border border-gray-600'
                          }`}
                        />
                        <RadioGroup.Label as="p" className="text-sm text-body">
                          {plan.label}
                        </RadioGroup.Label>
                      </div>
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
        </Scrollbar>
      )}
    </>
  );
};

export default Sorting;
