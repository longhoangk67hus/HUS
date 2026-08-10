using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BaseCoreService.Entities.Attributes;
using BaseCoreService.Entities;

namespace LibraryManagement.Entities
{
    [TableConfig(tableName: "`book`")]
    public class Book : BaseEntity
    {

        [Key]
        public int ID { get; set; }

        [Required]
        [StringLength(255)]
        public string Title { get; set; } = string.Empty;

        [StringLength(20)]
        public string? Isbn { get; set; }

        public string? Description { get; set; }

        [StringLength(150)]
        public string? Publisher { get; set; }

        public int? PublicationYear { get; set; }

        public int TotalQuantity { get; set; }

        public int AvailableQuantity { get; set; }

        [StringLength(255)]
        public string? ThumbnailUrl { get; set; }

        [NotMapped]
        public List<Author> Authors { get; set; } = [];

        [NotMapped]
        public List<Category> Categories { get; set; } = [];

        #region Filter field

        [NotMapped]
        [FilterColumn]
        public string AuthorFilter { get; set; }

        [NotMapped]
        [FilterColumn]
        public string CategoryFilter { get; set; } 
        #endregion

        private List<BookAuthor> _bookAuthors;
        // Navigation properties for relationships

        [NotMapped]
        public virtual List<BookAuthor> BookAuthors
        {
            get
            {
                _bookAuthors ??= [];
                if (_bookAuthors.Count == 0)
                {
                    foreach (var author in Authors)
                    {
                        var item = new BookAuthor()
                        {
                            BookID = this.ID,
                            AuthorID = author.ID,
                        };
                        _bookAuthors.Add(item);
                    }

                }

                return _bookAuthors;
            }
            set
            {
                _bookAuthors = value;
            }
        }

        private List<BookCategory> _bookCategories;

        [NotMapped]
        public virtual List<BookCategory> BookCategories
        {
            get
            {
                _bookCategories ??= [];
                if (_bookCategories.Count == 0)
                {
                    foreach (var category in Categories)
                    {
                        var item = new BookCategory()
                        {
                            BookID = this.ID,
                            CategoryID = category.ID,
                        };
                        _bookCategories.Add(item);
                    }

                }

                return _bookCategories;
            }
            set
            {
                _bookCategories = value;
            }
        }

        public Book()
        {
            EntityDetailConfigs =
            [
                new()
                {
                    DetailTableName = "book_author",
                    PropertyNameOnMaster = "BookAuthors",
                    ForeignKeyName = "BookID"
                },

                new()
                {
                    DetailTableName = "book_category",
                    PropertyNameOnMaster = "BookCategories",
                    ForeignKeyName = "BookID"
                }

            ];
        }
    }
}
