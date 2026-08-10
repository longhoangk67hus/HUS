using BaseCoreService.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryManagement.Common
{
    public class LibraryManagementUtils
    {
        public static string GetStringQuery(string queryName)
        {
            return Utils.GetStringQuery(queryName, "Queries/LM_Queries.json");
        }
    }
}
