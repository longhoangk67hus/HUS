using BaseCoreService.BL;
using BaseCoreService.DL;
using LibraryManagement.DL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryManagement.BL
{
  public class CategoryBL : BaseBL, ICategoryBL
  {
    public CategoryBL(ICategoryDL categoryDL, ServiceCollection serviceCollection) : base(categoryDL, serviceCollection)
    {
      this._baseDL = categoryDL;
    }
  }
}
