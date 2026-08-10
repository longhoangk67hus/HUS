
using BaseCoreService.BL;
using BaseCoreService.Common.Resources;
using BaseCoreService.Entities;
using BaseCoreService.Entities.DTO;
using BaseCoreService.Entities.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;


namespace ECommerce.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class BaseController<T> : ControllerBase where T : BaseEntity
    {
        protected IBaseBL _baseBL;

        private Type _currentType;

        protected Type CurrentType
        {
            get
            {
                if (_currentType == null)
                {
                    throw new Exception("Current type is null");
                }
                return _currentType;
            }
            set
            {
                _currentType = value;
            }
        }


        public BaseController(IBaseBL baseBL)
        {
            _baseBL = baseBL;
        }

        [HttpGet]
        public virtual async Task<IActionResult> GetAll()
        {
            var response = new ServiceResponse();
            var res = await _baseBL.GetAll<BaseEntity>(this.CurrentType);
            return Ok(response.OnSuccess(JsonConvert.DeserializeObject(JsonConvert.SerializeObject(res), typeof(List<>).MakeGenericType(this.CurrentType))));
        }

        [HttpGet("{id}")]
        public virtual async Task<IActionResult> GetByID([FromRoute] string id)
        {
            var response = new ServiceResponse();
            var res = await _baseBL.GetByID<BaseEntity>(this.CurrentType, id);
            return Ok(response.OnSuccess(res));
        }

        [HttpPost("paging")]
        //[Authorize(Policy = AuthenPolicy.AdminRequirement)]
        public virtual async Task<IActionResult> GetPaging([FromBody] PagingRequest pagingRequest)
        {
            if (pagingRequest == null)
            {
                return BadRequest();
            }
            if (pagingRequest.CustomParams != null)
            {
                var json = Convert.ToString(pagingRequest.CustomParams);
                var dictionary = JsonConvert.DeserializeObject<Dictionary<string, object>>(json);
                pagingRequest.CustomParams = dictionary;
            }
            var response = new ServiceResponse();
            var result = await _baseBL.GetPagingAsync(CurrentType, pagingRequest);
            return Ok(response.OnSuccess(result));
        }

        [HttpPost]
        [Authorize(Policy = AuthenPolicy.AdminRequirement)]
        public virtual async Task<IActionResult> Save([FromBody] T stringEntity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            stringEntity.State = BaseCoreService.Entities.Enums.ModelState.Insert;
            var entity = (BaseEntity)stringEntity;//JsonConvert.DeserializeObject(stringEntity.ToString(), this.CurrentType);
            return Ok(await _baseBL.SaveAsync(entity));
        }

        [HttpPost("bulk")]
        [Authorize(Policy = AuthenPolicy.AdminRequirement)]
        public virtual async Task<IActionResult> SaveList([FromBody] object stringEntity)
        {
            try
            {

                var entities = (IEnumerable<BaseEntity>)JsonConvert.DeserializeObject(stringEntity.ToString(), typeof(List<>).MakeGenericType(this.CurrentType));

                return Ok(await _baseBL.SaveListAsync(entities));

            }
            catch (Exception ex)
            {
                return BadRequest(
                    new ServiceResponse().OnException(new ExceptionResponse() { ExceptionMessage = ex.Message })

                );
            }
        }

        [HttpPut("{id}")]
        [Authorize(Policy = AuthenPolicy.AdminRequirement)]
        public virtual async Task<IActionResult> Update([FromBody] T stringEntity, [FromRoute] string id)
        {
            try
            {
                var response = new ServiceResponse();
                if (stringEntity == null)
                {
                    return BadRequest(response.OnError(new ErrorResponse() { ErrorMessage = Resource.DEV_NullRequestObject }));
                }
                var entity = (BaseEntity)stringEntity;

                entity.SetPrimaryKey(id);
                entity.State = BaseCoreService.Entities.Enums.ModelState.Update;
                return Ok(await _baseBL.UpdateOneAsync(entity));

            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    new ServiceResponse().OnException(new ExceptionResponse() { ExceptionMessage = ex.Message })

                );
            }
        }

        [HttpPatch("{id}")]
        [Authorize(Policy = AuthenPolicy.AdminRequirement)]
        public virtual async Task<IActionResult> UpdateFields([FromBody] object stringEntity, [FromRoute] string id)
        {
            try
            {
                var response = new ServiceResponse();
                if (stringEntity == null)
                {
                    return BadRequest(response.OnError(new ErrorResponse() { ErrorMessage = Resource.DEV_NullRequestObject }));
                }
                var entity = (BaseEntity)Activator.CreateInstance(CurrentType);
                var fieldUpdates = JsonConvert.DeserializeObject<List<EntityFieldUpdate>>(stringEntity.ToString());

                entity.SetPrimaryKey(id);
                return Ok(await _baseBL.SaveChangesAsync(entity, fieldUpdates));

            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    new ServiceResponse().OnException(new ExceptionResponse() { ExceptionMessage = ex.Message })

                );
            }
        }

        [HttpDelete("bulk")]
        [Authorize(Policy = AuthenPolicy.AdminRequirement)]
        public virtual async Task<IActionResult> DeleteList([FromBody] object stringEntity)
        {
            try
            {
                var entities = (IEnumerable<BaseEntity>)JsonConvert.DeserializeObject(stringEntity.ToString(), typeof(List<>).MakeGenericType(this.CurrentType));

                if (entities == null)
                {
                    return BadRequest();
                }
                return Ok(await _baseBL.DeleteListAsync(entities));

            }
            catch (Exception ex)
            {
                return BadRequest(
                    new ServiceResponse().OnException(new ExceptionResponse() { ExceptionMessage = ex.Message })

                );
            }
        }
    }
}
