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
  public class AuthorBL : BaseBL, IAuthorBL
  {
    public AuthorBL(IAuthorDL authorDL, ServiceCollection serviceCollection) : base(authorDL, serviceCollection)
    {
      this._baseDL = authorDL;
    }
  }
}
