// components/Navbar.js
import React from 'react';
import Link from 'next/link';


const Navbar = () => {

  return (
    <nav>
      <ul>
        <li>
          <Link legacyBehavior href="/" >
            <a>Home</a>
          </Link>
        </li>
        <li>  
        <Link legacyBehavior href="/Page" >
          <a>BTC</a>
        </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

