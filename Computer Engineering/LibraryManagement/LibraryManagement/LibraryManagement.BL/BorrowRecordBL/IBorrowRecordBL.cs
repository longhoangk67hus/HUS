using BaseCoreService.BL;
using BaseCoreService.Entities.DTO;
using LibraryManagement.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryManagement.BL
{
    public interface IBorrowRecordBL : IBaseBL
    {
        Task<ServiceResponse> BorrowBookByAvailableQuantityAsync(int bookId, int quantity);

        Task<PagingResponse> GetPagingCustomAsync(PagingRequest pagingRequest);

        Task<ServiceResponse> ReturnBookAsync(int bookId, BorrowingStatus status);
    }
}
