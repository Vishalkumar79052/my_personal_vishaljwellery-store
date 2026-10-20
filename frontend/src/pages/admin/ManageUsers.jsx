import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios.js";
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  ShoppingCart,
  Calendar,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  X,
} from "../../components/icons/LucideIcons.jsx";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'deactivated'
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'user' | 'admin'
  const [notice, setNotice] = useState("");

  // Customer Orders Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Deletion Modal
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadUsers = () => {
    setLoading(true);
    api
      .get("/admin/users")
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.warn("Failed to load users:", err.message);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleActive = async (u) => {
    try {
      const res = await api.put(`/admin/users/${u._id}`, { isActive: !u.isActive });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isActive: res.data.isActive } : x)));
      setNotice(`Account for "${u.name}" has been ${res.data.isActive ? "activated" : "deactivated"}.`);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setNotice(err.response?.data?.message || "Could not update customer status");
    }
  };

  const openCustomerOrdersModal = async (u) => {
    setSelectedCustomer(u);
    setLoadingOrders(true);
    try {
      const res = await api.get(`/admin/users/${u._id}/orders`);
      setCustomerOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Could not load customer orders:", err.message);
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };


  const confirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/admin/users/${deletingUser._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== deletingUser._id));
      setNotice(`Customer "${deletingUser.name}" account deleted.`);
      setDeletingUser(null);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Could not delete user account");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? u.isActive !== false
          : u.isActive === false;

      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u._id?.toLowerCase().includes(q);

      return matchesStatus && matchesRole && matchesSearch;
    });
  }, [users, statusFilter, roleFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Customer Accounts
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {filteredUsers.length} clients
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Review client spending histories, purchase counts, account statuses, and order manifests.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 shadow-2xs self-start sm:self-auto"
          title="Refresh Customer Accounts"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-soft animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice("")} className="text-emerald-700 font-semibold hover:text-emerald-950">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-xs text-stone-400 hover:text-stone-700"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-700"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active Only</option>
            <option value="deactivated">Deactivated</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-700"
          >
            <option value="all">All Roles</option>
            <option value="user">Clients (Users)</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-300 border-t-emerald-800 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-500">Loading customer accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-stone-900">No Customers Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {searchTerm
                ? `No accounts match your query "${searchTerm}".`
                : "No customer profiles found matching active filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-stone-200/80 text-stone-500 font-medium">
                <tr>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Role</th>
                  <th className="py-3 px-5">Joined</th>
                  <th className="py-3 px-5">Orders</th>
                  <th className="py-3 px-5">Lifetime Spend</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 font-bold flex items-center justify-center font-display text-xs border border-stone-200 shrink-0">
                          {u.name?.charAt(0).toUpperCase() || "C"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900 truncate max-w-[170px]">{u.name}</p>
                          <p className="text-[11px] text-stone-400 truncate max-w-[170px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-stone-600">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-5">
                      <button
                        onClick={() => openCustomerOrdersModal(u)}
                        className="font-semibold text-emerald-800 hover:text-emerald-950 underline inline-flex items-center gap-1"
                      >
                        <span>{u.orderCount || 0} orders</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-5 font-display font-bold text-stone-900">
                      ${(u.totalSpent || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.isActive !== false
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {u.isActive !== false ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2.5">
                      <button
                        onClick={() => openCustomerOrdersModal(u)}
                        className="text-stone-600 hover:text-stone-900 font-medium underline"
                        title="View Purchase History"
                      >
                        Orders
                      </button>

                      {u.role !== "admin" && (
                        <button
                          onClick={() => toggleActive(u)}
                          className="text-emerald-800 hover:text-emerald-950 font-semibold underline"
                        >
                          {u.isActive !== false ? "Deactivate" : "Activate"}
                        </button>
                      )}

                      {u.role !== "admin" && (
                        <button
                          onClick={() => {
                            setDeleteError("");
                            setDeletingUser(u);
                          }}
                          className="text-red-600 hover:text-red-800 font-semibold underline"
                        >
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
      </div>

      {/* Customer Purchase History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-stone-200 shadow-2xl space-y-5 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-display text-xl font-bold text-stone-900">
                  {selectedCustomer.name}'s Order History
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">{selectedCustomer.email}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {loadingOrders ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-7 h-7 border-2 border-emerald-300 border-t-emerald-800 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-stone-500">Loading order records...</p>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="py-8 text-center space-y-2 bg-[#FAF9F6] rounded-2xl border border-stone-200">
                <p className="font-semibold text-stone-700 text-xs">No orders placed by this customer yet.</p>
                <p className="text-[11px] text-stone-400">Past purchases will appear here upon checkout.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customerOrders.map((ord) => (
                  <div
                    key={ord._id}
                    className="p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-stone-900">
                          #{ord._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-stone-400 ml-2">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="capitalize font-semibold text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {ord.status}
                        </span>
                        <span className="font-display font-bold text-stone-900">
                          ${ord.totalPrice?.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Items snippet */}
                    <div className="pt-2 border-t border-stone-200/60 flex items-center gap-2 overflow-x-auto">
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 shrink-0 bg-white px-2 py-1 rounded-lg border border-stone-200">
                          {it.image && (
                            <img src={it.image} alt={it.name} className="w-5 h-5 rounded object-cover" />
                          )}
                          <span className="text-[10px] text-stone-700 font-medium">{it.name}</span>
                          <span className="text-[10px] text-stone-400">×{it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="btn-secondary !text-xs !py-2"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User In-App Modal Dialog */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900">Delete Customer Profile</h3>
                <p className="text-xs text-stone-500">Remove customer login credentials.</p>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              Are you sure you want to delete customer account <strong className="text-stone-900 font-bold">"{deletingUser.name}"</strong> ({deletingUser.email})?
            </p>

            {deleteError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {deleteError}
              </div>
            )}

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={isDeleting}
                className="btn-secondary !text-xs !py-2.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
