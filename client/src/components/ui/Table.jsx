import React from 'react';

const Table = ({ columns, data, keyField = 'id', emptyMessage = 'Tidak ada data' }) => {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={col.style}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr key={row[keyField] || rowIdx}>
                {columns.map((col, colIdx) => (
                  <td key={colIdx} style={col.style}>
                    {col.cell ? col.cell(row, rowIdx) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
