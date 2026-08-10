using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BaseCoreService.Entities;
using BaseCoreService.Entities.Attributes;

namespace LibraryManagement.Entities
{
    [TableConfig("borrowing_record")]
    public class BorrowingRecord : BaseEntity
    {
        [Key]
        [Required]
        public int ID { get; set; }
        public Guid UserID { get; set; }
        public int BookID { get; set; }

        public int Quantity { get; set; }
        public DateTime BorrowDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public BorrowingStatus Status { get; set; }

        [NotMapped]
        public Book Book { get; set; }

        [NotMapped]
        public User User { get; set; }
    }
}
