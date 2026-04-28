import { NavLink } from "react-router-dom";
import s from "./NavBar.module.css";

const ITEMS = [
  { path: "/",           icon: "⌂", label: "ГЛАВНАЯ",    end: true  },
  { path: "/play",       icon: "⚔", label: "ИГРАТЬ"               },
  { path: "/characters", icon: "♛", label: "ГЕРОИ"                },
  { path: "/rating",     icon: "★", label: "РЕЙТИНГ"              },
  { path: "/friends",    icon: "◈", label: "ДРУЗЬЯ"               },
] as const;

export function NavBar() {
  return (
    <nav className={s.nav}>
      {ITEMS.map(({ path, icon, label, end }) => (
        <NavLink
          key={path}
          to={path}
          end={end}
          className={({ isActive }) => `${s.item} ${isActive ? s.itemActive : ""}`}
        >
          <span className={s.icon}>{icon}</span>
          <span className={s.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
