import PolicyForm from "@/components/PolicyForm";

export default function PoliciesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Token Policies</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure ABAC enforcement rules governing token issuance for protected resource paths.
        </p>
      </div>

      <PolicyForm />
    </div>
  );
}
