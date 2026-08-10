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
    public class AuthorsController : BaseController<Author>
    {
        public AuthorsController(IAuthorBL movieBL) : base(movieBL)
        {
            this._baseBL = movieBL;
            this.CurrentType = typeof(Author);
        }

    }
}
