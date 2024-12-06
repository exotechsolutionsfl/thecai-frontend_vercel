'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useMenuNavigation } from '@/hooks/useMenuNavigation';
import { MenuList } from '@/components/dynamic-menu/MenuList';

export default function DynamicContentPage() {
  const searchParams = useSearchParams();
  const { menuState, currentPath, error, fetchMenuItems, expandMenuItem, navigateBack } = useMenuNavigation();

  const make = searchParams.get('make') || '';
  const model = searchParams.get('model') || '';
  const year = searchParams.get('year') || '';

  useEffect(() => {
    if (make && model && year) {
      fetchMenuItems({ make, model, year });
    }
  }, [make, model, year, fetchMenuItems]);

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          {currentPath.length > 0 && (
            <Button
              variant="ghost"
              className="mb-4"
              onClick={navigateBack}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <MenuList
            items={menuState.root || []}
            onExpand={(item) => expandMenuItem(item, { make, model, year })}
            menuState={menuState}
          />
        </div>
      </div>
    </div>
  );
}