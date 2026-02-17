import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">💰 FinanceTracker</div>

      <ul className="nav-links">
        <li>Dashboard</li>
        <li>Add Transaction</li>
      </ul>

      <div className="profile">
        <div className="avatar">BK</div>
      </div>
    </nav>
  );
}

export default Navbar;
