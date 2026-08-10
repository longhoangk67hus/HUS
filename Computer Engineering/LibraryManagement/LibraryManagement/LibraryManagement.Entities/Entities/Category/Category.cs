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


    [TableConfig("category")]
    public class Category: BaseEntity
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        // Navigation property for the relationship with Book
        [NotMapped]
        public virtual ICollection<BookCategory> BookCategories { get; set; } = [];
    }
}
