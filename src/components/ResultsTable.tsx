import { FlightResult } from "../types";

export function ResultsTable({ results }: { results: FlightResult[] }) {
  return (
    <table className="result">
      <thead>
        <tr>{["Departure", "Return", "Price", ""].map((h, i) => (
          <th key={i} className="result_header" >{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {results.map((r, i) => (
          <tr key={i}>
            <td className="result_row">{r.departure}</td>
            <td className="result_row">{r.return ?? "—"}</td>
            <td className="result_row">${r.price}</td>
            <td className="result_row">
              {r.url && (
                <a className="result_book" href={r.url} target="_blank" rel="noreferrer">Book</a>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}