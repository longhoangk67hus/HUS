using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LibraryManagement.Entities;

namespace LibraryManagement.Entities.DTO
{
    public record ReturnBookRequest
    {
        public int BorrowingRequestId { get; set; }

        public BorrowingStatus Stauts { get; set; }
    }
}
