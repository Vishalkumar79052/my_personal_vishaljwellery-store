import { useEffect, useState } from "react";
import api from "../../api/axios.js";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");

  const loadUsers = () =>
    api
      .get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.warn("Failed to load users:", err.response?.data?.message || err.message);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleActive = async (u) => {
    try {
      await api.put(`/admin/users/${u._id}`, { isActive: !u.isActive });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isActive: !u.isActive } : x)));
      setNotice(`User ${u.name} status updated.`);
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setNotice(err.response?.data?.message || "Could not update user status");
    }
  };

  const openDeleteModal = (u) => {
    setDeleteError("");
    setDeletingUser(u);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/admin/users/${deletingUser._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== deletingUser._id));
      setNotice(`User "${deletingUser.name}" has been deleted.`);
      setDeletingUser(null);
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Could not delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Users</h1>

      {notice && (
        <div id="user-action-notice" className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} className="text-emerald-700 hover:text-emerald-900 font-semibold text-xs ml-4">Dismiss</button>
        </div>
      )}

      {loading ? (
        <p className="text-forest-700/60 text-sm">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-forest-700/60 border-b border-forest-100">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-forest-50 hover:bg-forest-50/30 transition-colors">
                  <td className="py-3 pr-4 font-medium">{u.name}</td>
                  <td className="py-3 pr-4 text-forest-700/70">{u.email}</td>
                  <td className="py-3 pr-4 capitalize">{u.role}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        u.isActive ? "bg-forest-100 text-forest-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right space-x-3 whitespace-nowrap">
                    {u.role !== "admin" && (
                      <button onClick={() => toggleActive(u)} className="text-forest-700 hover:text-forest-950 underline font-medium cursor-pointer">
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                    {u.role !== "admin" && (
                      <button onClick={() => openDeleteModal(u)} className="text-clay-600 hover:text-red-700 underline font-medium cursor-pointer">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete User In-App Modal */}
      {deletingUser && (
        <div id="delete-user-modal" className="fixed inset-0 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-cream rounded-2xl p-6 w-full max-w-md border border-forest-100 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-ink">Delete User</h2>
            </div>

            <p className="text-forest-700/80 text-sm mb-4 leading-relaxed">
              Are you sure you want to permanently delete user <strong className="text-ink font-semibold">"{deletingUser.name}"</strong> ({deletingUser.email})?
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                id="confirm-delete-user-button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                type="button"
                id="cancel-delete-user-button"
                onClick={() => {
                  setDeletingUser(null);
                  setDeleteError("");
                }}
                disabled={isDeleting}
                className="btn-secondary flex-1 py-2.5 px-4 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
