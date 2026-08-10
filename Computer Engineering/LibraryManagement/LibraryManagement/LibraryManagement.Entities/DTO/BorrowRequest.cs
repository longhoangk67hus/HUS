using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryManagement.Entities.DTO
{
    public record BorrowRequest
    {
        public int BookID { get; set; }

        public int Quantity { get; set; }
    }
}
