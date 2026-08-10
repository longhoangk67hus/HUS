using BaseCoreService.Entities.Attributes;
using BaseCoreService.Entities;
using LibraryManagement.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryManagement.Entities
{
    [TableConfig("Author")]
    public class Author : BaseEntity
    {
        [Key]
        [Column("ID")]
        public int ID { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        // Navigation property for the relationship with Book
        public List<BookAuthor> BookAuthors { get; set; } = [];
    }
}
