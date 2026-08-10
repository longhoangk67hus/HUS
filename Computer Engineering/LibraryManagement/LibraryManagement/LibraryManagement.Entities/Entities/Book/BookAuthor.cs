using LibraryManagement.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BaseCoreService.Entities.Attributes;
using BaseCoreService.Entities;

namespace LibraryManagement.Entities
{
    [TableConfig("book_author")]
    public class BookAuthor : BaseEntity
    {
        [Key]
        public string ID { get; set; }

        public int BookID { get; set; }

        public int AuthorID { get; set; }

    }
}
