using BaseCoreService.BL;
using ECommerce.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using BaseCoreService.Entities.DTO;
using Microsoft.AspNetCore.Authorization;
using BaseCoreService.Entities.Constants;
using LibraryManagement.BL;
using LibraryManagement.Entities;
using LibraryManagement.Entities.DTO;
using BaseCoreService.Authen.Policies;
namespace FreeMovie.API.Controllers
{
    [ApiController]
    public class BorrowingRecordsController : BaseController<BorrowingRecord>
    {
        public BorrowingRecordsController(IBorrowRecordBL borrowBL) : base(borrowBL)
        {
            this._baseBL = borrowBL;
            this.CurrentType = typeof(BorrowingRecord);
        }

        [HttpPost("borrowing-record")]
        [Authorize]
        public async Task<IActionResult> BorrowBookByAvailableQuantityAsync([FromBody] BorrowRequest request)
        {
            var result = await ((IBorrowRecordBL)this._baseBL).BorrowBookByAvailableQuantityAsync(request.BookID, request.Quantity);
            return Ok(result);
        }

        [HttpPost("return")]
        [Authorize]
        public async Task<IActionResult> BorrowBookByAvailableQuantityAsync([FromBody] ReturnBookRequest request)
        {
            var result = await ((IBorrowRecordBL)this._baseBL).ReturnBookAsync(request.BorrowingRequestId, request.Stauts);
            return Ok(result);
        }

        [Authorize]
        public override async Task<IActionResult> GetPaging([FromBody] PagingRequest pagingRequest)
        {
            var res = await ((IBorrowRecordBL)this._baseBL).GetPagingCustomAsync(pagingRequest);
            return Ok(res);
        }


        [Authorize(AuthenPolicy.AdminRequirement)]
        public override Task<IActionResult> GetAll()
        {
            return base.GetAll();
        }


    }
}
