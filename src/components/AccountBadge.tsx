import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useUserRole } from "../hooks/useUserRole";

/** Circular avatar with a click-to-open account menu (admin/test links, sign out). */
export function AccountBadge() {
  const { user, signOut } = useAuth();
  const { isAdmin, canAccessTests } = useUserRole();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  console.log("user_metadata:", user.user_metadata);

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "Gardener";
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="account-badge" ref={rootRef} onPointerDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="account-badge__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="account-badge__avatar"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="account-badge__avatar account-badge__avatar--fallback">
            {initial}
          </span>
        )}
      </button>

      {open && (
        <div className="account-badge__menu" role="menu">
          <p className="account-badge__menu-name">{name}</p>
          {isAdmin && (
            <a href="/admin" className="account-badge__menu-link" role="menuitem">
              Admin Menu
            </a>
          )}
          {canAccessTests && (
            <a href="/tests" className="account-badge__menu-link" role="menuitem">
              Tests Menu
            </a>
          )}
          <button
            type="button"
            className="account-badge__menu-signout"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}