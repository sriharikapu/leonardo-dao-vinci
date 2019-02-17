import React, { Component } from "react";
import styles from "./Hero.module.scss";
import cx from "classnames";
import logos from "./pic_bg.png";
import genArt from "./../../images/gen-1.png";

export default class Hero extends Component {
  renderLogo(name, imgUrl) {
    return (
      <div className={cx(styles.logo, styles[name])}>
        <img alt="zeppelin" className="logo-img" src={imgUrl} />
      </div>
    );
  }
  render() {
    return (
      <div style={{ width: "100%" }}>
        <div
          className={styles.Hero}
          style={{ backgroundImage: `url(${genArt})` }}
        >
          <div className={styles.hwrapper}>
            <div
              className={styles.left}
              style={{ backgroundColor: "cadetblue", color: "black" }}
            >
              <h1 style={{ padding: "20px", fontWeight: "900" }}>
                {" "}
                Join the Machine Art Revolution!
              </h1>
              <h2 style={{ color: "black", paddingLeft: "20px" }}>
                Vote for computer generated art. The autonomous Dao Vinci art
                collective mints and sells select pieces as unique digital
                collectibles. Profits are shared with all!
                {/* Join us in rating computer generated art. We mint the most popular as digital collectibles, and share the eth with our users. */}
              </h2>
            </div>
          </div>
          <div>{/* <h1 style={{padding : '7vh'}}>Team</h1> */}</div>
        </div>
        <div className="row" style={{ backgroundColor: "white", marginTop : '5vh'}}>
          <div className="col-sm">
            <h2 style={{ color: "black" }}>Make</h2>
            <p style={{ color: "black" }}></p>
          </div>
          <div className="col-sm">
            <h2 style={{ color: "black" }}>Mint</h2>
            <p style={{ color: "black" }}></p>
          </div>
          <div className="col-sm">
            <h2 style={{ color: "black" }}>Marvel</h2>
            <p style={{ color: "black" }}></p>
          </div>
        </div>
      </div>
    );
  }
}
