import React, { Component } from "react";
import styles from './Hero.module.scss';
import cx from 'classnames';
import logos from './pic_bg.png';
import genArt from './../../images/gen-1.png'

export default class Hero extends Component {

  renderLogo(name, imgUrl) {
    return (
      <div className={cx(styles.logo, styles[name])}>
        <img alt="zeppelin" className="logo-img"
          src={imgUrl} />
      </div>
    );
  }
  render()  {
    return (
      <div className={styles.Hero} style={{backgroundImage : `url(${genArt})` }}>
        <div className={styles.hwrapper}>
          <div className={styles.left} style={{ backgroundColor : 'cadetblue',color: "black"}}>
            <h1 style={{ padding: "20px", fontWeight : "900"}}> Join the Machine Art Revolution!</h1>
            <h2 style={{ color: "black"}}>
              Vote for computer generated art. 
              The autonomous Dao Vinci art collective mints and sells select pieces as unique
              digital collectibles. 
              Profits are shared with all! 
              {/* Join us in rating computer generated art. We mint the most popular as digital collectibles, and share the eth with our users. */}
            </h2>
            {/* <div className={styles.sellingpoints}>
              <div className={styles.feature}>
                - Includes <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://openzeppelin.org/">OpenZeppelin</a> as an EVM package.
              </div>
              <div className={styles.feature}>
                - Upgradeable smart contracts with <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://zeppelinos.org/">ZeppelinOS</a>.
              </div>
              <div className={styles.feature}>
                - Includes <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://infura.io">
                 Infura</a> setup for easy deployments & connection.
              </div>
              <div className={styles.feature}>
                - <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://truffleframework.com/">
                 Truffle</a> to compile & test smart contracts.
              </div>
              <div className={styles.feature}>
                - <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/facebook/create-react-app">React </a> &
                  &nbsp;<a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://rimble.consensys.design">Rimble</a> to build usable and friendly interfaces.
              </div>
            </div>
            <div className={styles.ctas}>
              <a
                className={styles.mainLink}
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/zeppelinos/zepkit">
               > View code on github
              </a>
            </div> */}
          </div>
          {/* <div className={styles.right}>
            <img alt="Zepkit" src={logos} />
          </div> */}
        </div>
      </div>
    );
  }
}
