using BaseCoreService.BL;
using BaseCoreService.DL;
using LibraryManagement.DL;
using LibraryManagement.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BaseCoreService.Entities;
using BaseCoreService.Entities.Attributes;
using BaseCoreService.Entities.Enums;
using System.Transactions;
using BaseCoreService.Entities.DTO;
using System.Net;

namespace LibraryManagement.BL
{
    public class BorrowRecordBL : BaseBL, IBorrowRecordBL
    {
        private readonly IBookBL _bookBL;

        private readonly IUserBL _userBL;

        public BorrowRecordBL(IBorrowRecordDL borrowRecordDL, IBookBL bookBL, IUserBL userBL, ServiceCollection serviceCollection) : base(borrowRecordDL, serviceCollection)
        {
            _bookBL = bookBL;
            _userBL = userBL;
        }

        public async Task<ServiceResponse> BorrowBookByAvailableQuantityAsync(int bookId, int quantity = 1)
        {
            var user = GetUserInfor();
            var serviceResonse = new ServiceResponse();
            if (user.UserID == Guid.Empty)
            {
                return serviceResonse.OnError(new ErrorResponse()
                {
                    ErrorMessage = "Không tồn tại User"
                });
            }

            var book = await _bookBL.GetByID<Book>(typeof(Book), bookId.ToString());

            if (book == null)
            {
                return serviceResonse.OnError(new ErrorResponse()
                {
                    ErrorMessage = "Không tồn tại sách"
                });
            }

            if (book.AvailableQuantity <= 0)
            {
                return serviceResonse.OnError(new ErrorResponse()
                {
                    ErrorMessage = "Số lượng sách không đủ để cho mượn"
                });
            }

            book.AvailableQuantity -= quantity;
            book.ModifiedBy = user.UserName;
            book.ModifiedDate = DateTime.UtcNow;
            book.State = ModelState.Update;

            var newRecord = new BorrowingRecord
            {
                BookID = bookId,
                UserID = user.UserID,
                BorrowDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(14),
                Status = BorrowingStatus.Borrowed,
                CreatedBy = user.UserName,
                CreatedDate = DateTime.UtcNow,
                State = ModelState.Insert
            };
            using (var connection = _baseDL.GetDbConnection(this.ConnectionString))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        await this.DoSaveAsync(newRecord, transaction);
                        await _bookBL.DoSaveAsync(book, transaction);
                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return serviceResonse.OnException(new ExceptionResponse()
                        {
                            ExceptionMessage = "Lỗi xử lý"
                        });
                    }
                }

            }

            return serviceResonse.OnSuccess(newRecord);
        }

        public async Task<ServiceResponse> ReturnBookAsync(int borrowingRecordId, BorrowingStatus status)
        {
            var user = GetUserInfor();
            var serviceResonse = new ServiceResponse();
            if (user.UserID == Guid.Empty)
            {
                return serviceResonse.OnError(new ErrorResponse()
                {
                    ErrorMessage = "Không tồn tại User"
                });
            }

            var borrowingRecord = await this.GetByID<BorrowingRecord>(typeof(BorrowingRecord), borrowingRecordId.ToString());
            if(borrowingRecord == null)
            {
                return serviceResonse.OnError(new ErrorResponse()
                {
                    ErrorMessage = "Không tồn tại lượt mượn sách"
                });
            }
            borrowingRecord.ReturnDate = DateTime.UtcNow;

            if(borrowingRecord.Status == BorrowingStatus.Returned)
            {
                serviceResonse.UserMessage = "Đã trả rồi không cần trả nữa";
                return serviceResonse.OnSuccess(true);
            }
            borrowingRecord.Status = status;

            if (borrowingRecord == null)
            {
                return serviceResonse.OnError(new ErrorResponse()
                {
                    ErrorMessage = "Không tồn tại lượt mượn sách"
                });
            }

            var book = await _bookBL.GetByID<Book>(typeof(Book), borrowingRecord.BookID.ToString());
            book.AvailableQuantity += borrowingRecord.Quantity;

            using (var connection = _baseDL.GetDbConnection(this.ConnectionString))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        
                        await _bookBL.DoSaveChangesAsync(book, new List<EntityFieldUpdate>()
                            {
                                new EntityFieldUpdate()
                                {
                                    FieldName = "AvailableQuantity",
                                    FieldValue = book.AvailableQuantity.ToString(),
                                }
                            }, transaction);

                        await DoSaveChangesAsync(borrowingRecord, new List<EntityFieldUpdate>()
                            {
                                new EntityFieldUpdate()
                                {
                                    FieldName = "Status",
                                    FieldValue = ((int)status).ToString(),
                                },
                                new EntityFieldUpdate()
                                {
                                    FieldName = "ReturnDate",
                                    FieldValue = borrowingRecord.ReturnDate.Value,
                                }
                            }, transaction);
                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return serviceResonse.OnException(new ExceptionResponse()
                        {
                            ExceptionMessage = "Lỗi xử lý"
                        });
                    }
                }

            }

            return serviceResonse.OnSuccess(borrowingRecord);
        }

        public override void OnBeforeExecutePagingQuery(ref string commandText, PagingRequest request)
        {
            base.OnBeforeExecutePagingQuery(ref commandText, request);
            var user = GetUserInfor();
            if (user != null && user.UserID != Guid.Empty)
            {
                request.CustomFilter = $"['UserID', '=', '{user.UserID}']";

            }
        }

        public override async Task<IEnumerable<IEnumerable<object>>> OnAfterExecutePagingQueryAsync(IEnumerable<IEnumerable<object>> result)
        {
            var res = await base.OnAfterExecutePagingQueryAsync(result);
            var user = GetUserInfor();
            if (user != null && user?.UserID != Guid.Empty)
            {
                var roleString = user.Roles.Select(r => r.RoleCode).ToList();
                if (roleString.Contains("ADMIN"))
                {


                    
                }
                var data = res.FirstOrDefault();
                var borrowingRecords = data?.Select(el => (BorrowingRecord)el)?.ToList();
                if (data != null)
                {
                    var bookids = borrowingRecords.Select(el => el.BookID);
                    var userids = borrowingRecords.Select(el => el.UserID);

                    var books = await _bookBL.GetAllAsync<Book>(new PagingRequest()
                    {
                        Filter = $"['ID', 'IN', '{string.Join(",", bookids)}']"
                    });

                    var users = await _userBL.GetAllAsync<User>(new PagingRequest()
                    {
                        Filter = $"['UserID', 'IN', '{string.Join(",", userids)}']"
                    });
                    foreach (var item in data)
                    {
                        (item as BorrowingRecord).Book = books.FirstOrDefault(b => b.ID == ((BorrowingRecord)item).BookID);
                        (item as BorrowingRecord).User = users.FirstOrDefault(u => u.UserID == ((BorrowingRecord)item).UserID);
                    }
                }
            }
            return res;
        }

        public async Task<PagingResponse> GetPagingCustomAsync(PagingRequest pagingRequest)
        {
            var user = GetUserInfor();
            var roleString = user.Roles.Select(r => r.RoleCode).ToList();
            if (user != null && user?.UserID != Guid.Empty && !roleString.Contains("ADMIN"))
            {
                pagingRequest.CustomFilter = $"['UserID', '=', '{user.UserID}']";
            }
            var res = await this.GetPagingAsync(typeof(BorrowingRecord), pagingRequest);

            return res;
        }
    }
}
