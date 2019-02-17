import React, { Component } from "react";

import Rachel from "./../../images/assets/rachel.jpeg";
import Stephen from "./../../images/assets/stephen.jpeg";
import Piers from "./../../images/assets/piers.jpeg";
import Ed from "./../../images/assets/ed.jpeg";
import Twitter from "./../../images/assets/Twitter_Social_Icon_Circle_White.png";

// "Rachel has a background in web development and has extensive experience building sophisticated frontends at Yoti and Flashtalking. She is currently working as a Tech Evangelist at Berlin-based blockchain Lisk. She is experienced in public speaking, online community management, and has a strong eye for design. She holds a BA in Geography from Cambridge University."

export default class Team extends Component {
  render() {
    const team = [
      {
        img: Rachel,
        name: "Rachel Black",
        twitter: "https://twitter.com/RachBLondon",
        bio:
          "Rachel’s background is in building sophisticated frontends, currently working as a Tech Evangelist. She is a blockchain enthusiast, and is excited about the new gaming prospects with NFTs."
      },
      {
        img: Stephen,
        name: "Stephen Jackson",
        twitter: "https://twitter.com/_stevejaxon",
        bio:
          "Stephen is an experienced blockchain developer, working full time in the space since 2017. focused heavily on Ethereum; he has worked on several Dapps, helped run Ethereum training workshops, gave presentations and even organised a Blockchain gaming Hackathon in London in partnership with Loomx."
      },
      {
        img: Piers,
        name: "Piers Powlesland",
        twitter: "https://twitter.com/piersypops",
        bio:
          "Piers is a software developer and architect with over 10 years experience, working for a range of companies, including building facebook game servers capable of scaling to many millions of players a day, for Electronic Arts (EA). He is currently architecting a custom built identity blockchain from network layer to consensus at Yoti."
      },
      {
        img: Ed,
        name: "Ed Harrod",
        twitter: "https://twitter.com/EddyHarrod",
        bio:
          "Ed is a polyglot developer, working as SDK Team Lead at Yoti in London. He regularly works with .NET, Python and Go, also enjoying working with Solidity in his spare time. He is fascinated by blockchain technology and its potential."
      }
    ];

    return (
      <div>
        <h1 style={{padding : '7vh'}}>Team</h1>
        <div className="row">
          {team.map((member, i) => (
            <div key={i} className="col-sm">
              <img
                style={{ height: "200px", borderRadius: "50%" }}
                src={member.img}
              />
              <h4 style={{ color: "black" }}>{member.name}</h4>
              <a href={member.twitter} target="_blank">
                <img style={{ height: "20px" }} src={Twitter} />
              </a>
              <p style={{ color: "black" }}>{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
