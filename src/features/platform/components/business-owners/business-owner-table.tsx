"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getBusinessOwnersAction,
} from "../../actions";

import {
  BusinessOwnerDialog,
} from "./business-owner-dialog";

type BusinessOwner = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  role: string;
  createdAt: string | Date;
};

export function BusinessOwnerTable() {

  const [owners, setOwners] =
    useState<BusinessOwner[]>([]);

  const [open, setOpen] =
    useState(false);

  async function loadOwners() {

    const result =
      await getBusinessOwnersAction();

    if (result.success) {
      setOwners(result.data ?? []);
    }

  }

  useEffect(() => {
    loadOwners();
  }, []);

  return (

    <main className="mx-auto max-w-7xl space-y-6 p-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Business Owners
          </h1>

          <p className="text-muted-foreground">
            Platform managed business owners.
          </p>

        </div>

        <button
          onClick={() => setOpen(true)}
          className="
            rounded-md
            bg-indigo-600
            px-4
            py-2
            text-white
            transition
            hover:bg-indigo-700
          "
        >
          Invite Owner
        </button>

      </div>

      <BusinessOwnerDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={loadOwners}
      />

      <div className="overflow-hidden rounded-xl border">

        <table className="w-full">

          <thead className="border-b bg-muted/40">

            <tr>

              <th className="p-4 text-left">
                Owner
              </th>

              <th className="p-4 text-left">
                Email
              </th>

              <th className="p-4 text-left">
                Phone
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Business
              </th>

              <th className="p-4 text-left">
                Created
              </th>

              <th className="p-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {owners.length === 0 ? (

              <tr>

                <td
                  colSpan={7}
                  className="
                    p-12
                    text-center
                    text-muted-foreground
                  "
                >
                  No business owners have been invited yet.
                </td>

              </tr>

            ) : (

              owners.map((owner) => (

                <tr
                  key={owner.id}
                  className="border-b hover:bg-muted/20"
                >

                  <td className="p-4 font-medium">
                    {owner.name}
                  </td>

                  <td className="p-4">
                    {owner.email}
                  </td>

                  <td className="p-4">
                    {owner.phone ?? "—"}
                  </td>

                  <td className="p-4">

                    <span
                      className={
                        owner.active
                          ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                          : "rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                      }
                    >
                      {owner.active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </td>

                  <td className="p-4 text-muted-foreground">
                    —
                  </td>

                  <td className="p-4">
                    {new Date(
                      owner.createdAt,
                    ).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      className="
                        rounded-md
                        border
                        px-3
                        py-1
                        text-sm
                        hover:bg-muted
                      "
                    >
                      View
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </main>

  );

}