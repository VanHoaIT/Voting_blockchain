// components/Navbar.js
import React from 'react';
import Link from 'next/link';
import styles from '../styles/Navbar.module.css'; 

const Navbar = ({ userAddress }) => {

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}> {/* Thêm một div cho phía bên trái */}
        <p>Địa chỉ ví: {userAddress}</p> {/* Hiển thị địa chỉ ví */}
      </div>
      <ul>

        <li>
          <Link legacyBehavior href="/" >
            <a>Home</a>
          </Link>
        </li>

        <li>  
        <Link legacyBehavior href="/Page" >
          <a>Page</a>
        </Link>
        </li>

        <li>  
        <Link legacyBehavior href="/Transaction" >
          <a>Transaction</a>
        </Link>
        </li>

        <li>  
        <Link legacyBehavior href="/History" >
          <a>History</a>
        </Link>
        </li>

      </ul>
    </nav>
  );
};

export default Navbar;

