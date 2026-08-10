using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BaseCoreService.Entities;
using BaseCoreService.Entities.Attributes;

namespace LibraryManagement.Entities
{
    [TableConfig("book_category")]
    public class BookCategory: BaseEntity
    {

        [Key]
        public int ID { get; set; }

        public int BookID { get; set; }

        public int CategoryID { get; set; }

        // Navigation properties
        [NotMapped]
        public virtual Book Book { get; set; }
        
        [NotMapped]
        public virtual Category Category { get; set; }
    }
}
