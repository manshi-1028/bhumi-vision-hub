import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Page, PageHeading, Protected } from "../components/site";
import { EmptyBox, ErrorBox, Loading } from "../components/states";
import { decideSubmission, getSubmissions } from "../lib/api";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review queue | BhoomiSetu" },
      { name: "description", content: "Government officials review, approve or reject research submitted to the repository." },
      { property: "og:title", content: "Review queue | BhoomiSetu" },
      { property: "og:description", content: "Official review queue for submitted land governance research." },
    ],
  }),
  component: () => (
    <Protected roles={["official"]}>
      <Review />
    </Protected>
  ),
});

function Review() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["submissions"], queryFn: getSubmissions });
  const decide = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "approve" | "reject" }) => decideSubmission(id, decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      qc.invalidateQueries({ queryKey: ["library"] });
    },
  });

  return (
    <Page>
      <PageHeading title="Review queue" description="Approved items appear in the public repository. Rejected items are removed." />

      {query.isPending ? <Loading /> : null}
      {query.isError ? <ErrorBox message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}

      {query.data ? (
        query.data.length === 0 ? (
          <EmptyBox message="No submissions are waiting for review." />
        ) : (
          <div className="panel overflow-x-auto p-4">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="py-2 pr-3 font-semibold">Reference</th>
                  <th className="py-2 pr-3 font-semibold">Title</th>
                  <th className="py-2 pr-3 font-semibold">Type</th>
                  <th className="py-2 pr-3 font-semibold">State</th>
                  <th className="py-2 pr-3 font-semibold">Year</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] align-top">
                    <td className="py-2 pr-3 tabular-nums">{item.id}</td>
                    <td className="py-2 pr-3">{item.title}</td>
                    <td className="py-2 pr-3">{item.type}</td>
                    <td className="py-2 pr-3">{item.state}</td>
                    <td className="py-2 pr-3 tabular-nums">{item.year}</td>
                    <td className="py-2 pr-3">{item.status}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn"
                          disabled={item.status === "approved" || decide.isPending}
                          onClick={() => decide.mutate({ id: item.id, decision: "approve" })}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn-outline"
                          disabled={decide.isPending}
                          onClick={() => decide.mutate({ id: item.id, decision: "reject" })}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </Page>
  );
}
