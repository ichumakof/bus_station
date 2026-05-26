using BusStation.API.Application.Abstractions;
using BusStation.API.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace BusStation.API.Infrastructure.DAL;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _db;

    public UnitOfWork(AppDbContext db)
    {
        _db = db;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _db.SaveChangesAsync(cancellationToken);

    public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default) =>
        _db.Database.BeginTransactionAsync(cancellationToken);
}
