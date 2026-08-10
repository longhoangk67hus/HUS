using BaseCoreService.BL;
using BaseCoreService.Common;
using BaseCoreService.DL;
using BaseCoreService.Entities.DTO;
using BaseCoreService.Entities.Extension;
using LibraryManagement.Common;
using LibraryManagement.DL;
using LibraryManagement.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryManagement.BL
{
    public class BookBL : BaseBL, IBookBL
    {

        public BookBL(IBookDL bookDL, ServiceCollection serviceCollection) : base(bookDL, serviceCollection)
        {
            this._baseDL = bookDL;
        }

        public override void OnBeforeExecutePagingQuery(ref string commandText, PagingRequest pagingRequest)
        {
            var customParams = pagingRequest?.CustomParams?.ToDictionary();

            if (customParams != null && customParams.TryGetValue("FilterByDetails", out var filterByDetails))
            {
                bool.TryParse(filterByDetails.ToString(), out var filterBudetails);
                if (filterBudetails)
                {
                    string tableName;
                    tableName = ", a.Name AS AuthorFilter, c.Name AS CategoryFilter FROM book b INNER JOIN book_author ba ON b.ID = ba.BookID INNER JOIN author a ON ba.AuthorID = a.ID INNER JOIN book_category bc ON b.ID = bc.BookID INNER JOIN category c ON bc.CategoryID = c.ID";
                    commandText = commandText.Replace("AuthorFilter", "a.Name").Replace("CategoryFilter", "c.Name");
                    commandText = commandText.Replace("*", "b.*");
                    commandText = commandText.Replace("FROM `book`", tableName);
                }

            }

        }

        public override async Task<T> GetByID<T>(Type type, string id)
        {
            var sql = LibraryManagementUtils.GetStringQuery("BookBL_GetFullDetailsByID");
            var result = await QueryMultipleAsyncUsingCommandText(new List<Type>() { typeof(Book), typeof(Author), typeof(Category) }, sql, new Dictionary<string, object>()
            {
                { "BookID", id}
            });
            var book = result.FirstOrDefault().FirstOrDefault() as Book;
            var authors = result.ElementAtOrDefault(1)?.Select(el => (Author)el).ToList();
            var categories = result?.ElementAtOrDefault(2)?.Select(el => el as Category).ToList();
            book.Categories = categories;
            book.Authors = authors;

            return book as T;

            
        }
    }
}
