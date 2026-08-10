using BaseCoreService.BL;
using BaseCoreService.Authen;
using BaseCoreService.DL;
using System.Text.Json;
using BaseCoreService.Extensions;
using BaseCoreService.Common.Middlewares;
using BaseCoreService.Common;
using LibraryManagement.BL;
using LibraryManagement.DL;
var builder = WebApplication.CreateBuilder(args);

var MyAllowSpecificOrigins = "_MyAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      builder =>
                      {
                          builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
                      });
});

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(opt => opt.JsonSerializerOptions.PropertyNamingPolicy = null);
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();
AuthenStartupImport.Init(builder);
DLStartupImport.Init(builder.Services, builder.Configuration);
BLStartupImport.Init(builder);
builder.Services.AddScoped<IBookBL, BookBL>();
builder.Services.AddScoped<IBookDL, BookDL>();

builder.Services.AddScoped<IAuthorBL, AuthorBL>();
builder.Services.AddScoped<IAuthorDL, AuthorDL>();

builder.Services.AddScoped<ICategoryBL, CategoryBL>();
builder.Services.AddScoped<ICategoryDL, CategoryDL>();

builder.Services.AddScoped<IBorrowRecordBL, BorrowRecordBL>();
builder.Services.AddScoped<IBorrowRecordDL, BorrowRecordDL>();



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    //app.UseMiddleware<ExceptionMiddleware>();
}
else
{
    app.UseMiddleware<ExceptionMiddleware>();
}

app.UseCors(MyAllowSpecificOrigins);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
