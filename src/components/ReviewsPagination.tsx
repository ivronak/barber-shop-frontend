import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReviewsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export const ReviewsPagination: React.FC<ReviewsPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}) => {
  // Generate pagination range
  const generatePaginationRange = () => {
    const range: (number | string)[] = [];
    
    // Always show first page
    range.push(1);
    
    // Calculate the start and end of the current range
    const startPage = Math.max(2, currentPage - siblingCount);
    const endPage = Math.min(totalPages - 1, currentPage + siblingCount);
    
    // Add ellipsis if there's a gap after first page
    if (startPage > 2) {
      range.push('...');
    }
    
    // Add pages in the middle
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    
    // Add ellipsis if there's a gap before last page
    if (endPage < totalPages - 1) {
      range.push('...');
    }
    
    // Always show last page if it exists and is different from first page
    if (totalPages > 1) {
      range.push(totalPages);
    }
    
    return range;
  };
  
  const paginationRange = generatePaginationRange();
  
  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {paginationRange.map((page, index) => {
        if (page === '...') {
          return (
            <Button 
              key={`ellipsis-${index}`} 
              variant="outline" 
              size="icon" 
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }
        
        return (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            onClick={() => onPageChange(Number(page))}
          >
            {page}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}; 