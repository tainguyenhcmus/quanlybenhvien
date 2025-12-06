import React from 'react';

export default function TableDanhSach({ columns, data, actions }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 text-left text-sm font-semibold">
                {col.title}
              </th>
            ))}
            {actions && <th className="px-6 py-4 text-left text-sm font-semibold">Hành động</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-gray-50 transition-colors">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-6 py-4 text-sm text-gray-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 text-sm">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

