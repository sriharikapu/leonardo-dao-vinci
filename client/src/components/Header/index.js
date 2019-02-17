import React from 'react';
import styles from './header.module.scss';
import logo from './zk_logo.svg';
import artLogo from './../../images/art-logo.png'
import leo from './../../images/leo-2.png';

const Header = () => (
  <div className={styles.header} style={{backgroundColor : 'white'}}>
    <nav id="menu" className="menu" >
      <div className={styles.brand}>
        <a href="/" className={styles.link}> <img src={leo} alt="logo" /></a>
      </div>
      <ul>
      <li><a style={{ color : 'black'}} href="/vote" className={styles.link}> Vote</a></li>
        <li><a style={{ color : 'black'}} href="/about" className={styles.link}> About</a></li>
      </ul>
    </nav>
  </div>
)

export default Header;
