using BaseCoreService.BL;
using ECommerce.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using BaseCoreService.Entities.DTO;
using Microsoft.AspNetCore.Authorization;
using BaseCoreService.Entities.Constants;
using LibraryManagement.BL;
using LibraryManagement.Entities;
namespace FreeMovie.API.Controllers
{
    [ApiController]
    public class CategoriesController : BaseController<Category>
    {
        public CategoriesController(ICategoryBL categoryBL) : base(categoryBL)
        {
            this._baseBL = categoryBL;
            this.CurrentType = typeof(Category);
        }


    }
}
