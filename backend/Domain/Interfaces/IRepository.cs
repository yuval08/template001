using IntranetStarter.Domain.Common;
using System.Linq.Expressions;

namespace IntranetStarter.Domain.Interfaces;

public interface IRepository<T> where T : BaseEntity {
    Task<T?>             GetByIdAsync(Guid                     id, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken         cancellationToken                                     = default);
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>>   predicate,        CancellationToken cancellationToken = default);
    Task<T>              AddAsync(T                            entity,           CancellationToken cancellationToken = default);
    Task<T>              UpdateAsync(T                         entity,           CancellationToken cancellationToken = default);
    Task                 DeleteAsync(T                         entity,           CancellationToken cancellationToken = default);
    Task<int>            CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken cancellationToken = default);
    Task<bool>           ExistsAsync(Expression<Func<T, bool>> predicate,        CancellationToken cancellationToken = default);
}

public interface IUnitOfWork : IDisposable {
    IRepository<T> Repository<T>() where T : BaseEntity;
    Task<int>      SaveChangesAsync(CancellationToken         cancellationToken = default);
    Task           BeginTransactionAsync(CancellationToken    cancellationToken = default);
    Task           CommitTransactionAsync(CancellationToken   cancellationToken = default);
    Task           RollbackTransactionAsync(CancellationToken cancellationToken = default);
}