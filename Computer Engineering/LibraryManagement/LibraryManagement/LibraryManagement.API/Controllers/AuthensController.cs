using BaseCoreService.BL;
using BaseCoreService.Entities;
using BaseCoreService.Entities.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FreeMovie.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AuthensController : ControllerBase
    {
        protected IAuthBL _authBL;
        protected IUserBL _userBL;
        public AuthensController(IAuthBL authBL, IUserBL userBL)
        {
            _authBL = authBL;
            _userBL = userBL;
        }

        [HttpPost("login")]
        public virtual async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            try
            {
                var response = await _authBL.Login(loginRequest);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ServiceResponse().OnException(new ExceptionResponse() { Data = ex }));
            }
        }

        [HttpPost("user/register")]
        public virtual async Task<IActionResult> Register([FromBody] RegisterInfo user)
        {
            try
            {
                if(!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var response = await _userBL.Register(user);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ServiceResponse().OnException(new ExceptionResponse() { Data = ex }));
            }
        }
    }
}
