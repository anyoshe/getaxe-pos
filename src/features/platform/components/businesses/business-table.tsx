export function BusinessTable() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">
          Businesses
        </h1>

        <p className="text-muted-foreground">
          Registered businesses.
        </p>
      </div>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="p-4 text-left">Business</th>
              <th className="p-4 text-left">Owner</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td
                colSpan={3}
                className="p-12 text-center text-muted-foreground"
              >
                No businesses yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}