using IntranetStarter.Domain.Common;
using IntranetStarter.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace IntranetStarter.Infrastructure.Data;

public class Repository<T>(ApplicationDbContext context) : IRepository<T>
    where T : BaseEntity {
    private readonly ApplicationDbContext _context = context;
    private readonly DbSet<T>             _dbSet   = context.Set<T>();

    public async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) {
        return await _dbSet.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default) {
        return await _dbSet.ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default) {
        return await _dbSet.Where(predicate).ToListAsync(cancellationToken);
    }

    public async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default) {
        var result = await _dbSet.AddAsync(entity, cancellationToken);
        return result.Entity;
    }

    public Task<T> UpdateAsync(T entity, CancellationToken cancellationToken = default) {
        _dbSet.Update(entity);
        return Task.FromResult(entity);
    }

    public Task DeleteAsync(T entity, CancellationToken cancellationToken = default) {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken cancellationToken = default) {
        if (predicate == null)
            return await _dbSet.CountAsync(cancellationToken);

        return await _dbSet.CountAsync(predicate, cancellationToken);
    }

    public async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default) {
        return await _dbSet.AnyAsync(predicate, cancellationToken);
    }
}

public class UnitOfWork(ApplicationDbContext context) : IUnitOfWork {
    private readonly Dictionary<Type, object>                                     _repositories = new();
    private          Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction? _transaction;

    public IRepository<T> Repository<T>() where T : BaseEntity {
        var type = typeof(T);
        if (!_repositories.TryGetValue(type, out object? value)) {
            value = new Repository<T>(context);
            _repositories[type] = value;
        }

        return (IRepository<T>)value;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) {
        return await context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default) {
        _transaction = await context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default) {
        if (_transaction != null) {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default) {
        if (_transaction != null) {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose() {
        _transaction?.Dispose();
        context.Dispose();
    }
}