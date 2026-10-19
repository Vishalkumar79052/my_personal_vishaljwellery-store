import { NavLink, Link } from "react-router-dom";

const DashboardSidebar = ({ title, links, isCustomAdmin }) => (
  <aside className="w-full md:w-64 shrink-0">
    <div className="bg-white rounded-3xl p-5 border border-forest-100 shadow-soft space-y-4">
      <div className="px-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-forest-900">{title}</h2>
          {isCustomAdmin && (
            <span className="text-[10px] font-semibold tracking-wider uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
              Admin
            </span>
          )}
        </div>
        <p className="text-xs text-forest-700/60 mt-0.5">Management Suite</p>
      </div>

      <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-forest-700 text-cream shadow-xs font-semibold"
                  : "text-forest-800 hover:bg-forest-50 hover:text-forest-950"
              }`
            }
          >
            {link.icon && <span className="shrink-0">{link.icon}</span>}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {isCustomAdmin && (
        <div className="pt-3 border-t border-forest-100 px-1">
          <Link
            to="/shop"
            className="flex items-center gap-2 text-xs font-medium text-forest-700 hover:text-forest-950 p-2 rounded-lg hover:bg-sand/40 transition-colors"
          >
            <svg className="w-4 h-4 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Customer Storefront →
          </Link>
        </div>
      )}
    </div>
  </aside>
);

export default DashboardSidebar;
