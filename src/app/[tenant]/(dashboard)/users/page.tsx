import UserDirectoryTable from "@/components/UserDirectoryTable";

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
          User Access Forms
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review tenant membership, MFA standing, and role assignments for every registered identity.
        </p>
      </div>

      <UserDirectoryTable />
    </div>
  );
}
