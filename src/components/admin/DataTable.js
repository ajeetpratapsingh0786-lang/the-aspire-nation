export default function DataTable({ columns, rows }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b text-gray-500">
            {columns.map((column) => (
              <th key={column} className="py-3">
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b last:border-none">
              {row.map((cell, i) => (
                <td key={i} className="py-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}