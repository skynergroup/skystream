import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  showPageNumbers = 5 
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const halfShow = Math.floor(showPageNumbers / 2);
    
    let startPage = Math.max(1, currentPage - halfShow);
    let endPage = Math.min(totalPages, currentPage + halfShow);
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < showPageNumbers) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + showPageNumbers - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - showPageNumbers + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  const handlePrevious = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNext = () => {
    handlePageChange(currentPage + 1);
  };

  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination">
      <div className="pagination-container">
        {/* Previous Button */}
        <button
          className={`pagination-btn pagination-prev ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
          <span>Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="pagination-numbers">
          {/* First page if not in range */}
          {pageNumbers[0] > 1 && (
            <>
              <button
                className="pagination-number"
                onClick={() => handlePageChange(1)}
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="pagination-ellipsis">...</span>
              )}
            </>
          )}

          {/* Page number buttons */}
          {pageNumbers.map(page => (
            <button
              key={page}
              className={`pagination-number ${page === currentPage ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          {/* Last page if not in range */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="pagination-ellipsis">...</span>
              )}
              <button
                className="pagination-number"
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Button */}
        <button
          className={`pagination-btn pagination-next ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Page Info */}
      <div className="pagination-info">
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </div>
  );
};

export default Pagination;
