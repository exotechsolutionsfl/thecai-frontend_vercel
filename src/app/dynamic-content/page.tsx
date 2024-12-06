'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { MenuItem } from '@/types/dynamic-menu';
import { useDynamicMenu } from '@/hooks/useDynamicMenu';
import MenuList from '@/components/dynamic-menu/MenuList';
import ContentDisplay from '@/components/dynamic-menu/ContentDisplay';

export default function DynamicContentPage() {
  const searchParams = useSearchParams();
  const { menuState, loading, error, currentPath, fetchMenuItems, toggleMenuItem, navigateBack } = useDynamicMenu();
  const [selectedContent, setSelectedContent] = useState<MenuItem | null>(null);

  const make = searchParams.get('make') || '';
  const model = searchParams.get('model') || '';
  const year = searchParams.get('year') || '';

  useEffect(() => {
    if (make && model && year) {
      fetchMenuItems({ make, model, year });
    }
  }, [make, model, year, fetchMenuItems]);

  const handleItemClick = async (path: string, item: MenuItem) => {
    if (item.type === 'chunk_text') {
      setSelectedContent(item);
    } else {
      if (!menuState[path] && !item.children) {
        const items = await fetchMenuItems({
          make,
          model,
          year,
          menu_path: item.name
        });
        
        if (items.length === 0) {
          setSelectedContent({
            ...item,
            type: 'chunk_text',
            content: { text_1: 'No further items found for this menu.' }
          });
          return;
        }
        
        item.children = items;
      }
      toggleMenuItem(path, item);
    }
  };

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
            path="root"
            onItemClick={handleItemClick}
            isLoading={loading}
          />
        </div>
        <div className="md:col-span-2">
          {selectedContent && <ContentDisplay item={selectedContent} />}
        </div>
      </div>
    </div>
  );
}