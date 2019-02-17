import React, {Component } from 'react';
import {Blockie, PublicAddress} from 'rimble-ui'
export default class Profile extends Component {
    render(){
        return (<div style={{width : '50vw'}}>
            <h1>Profile</h1>
            <Blockie opts={{seed: this.props.account, color: "#dfe", bgcolor: "#a71", size: 15, scale: 3, spotcolor: "#000"}} />
            <PublicAddress address={this.props.account}/>
            {/* {this.props.account} */}
        </div>)
    }
}